/**
Author: Justin DEKEYSER
Year: August 2023

Utility file to deal handle hard coded templates, hydratation and
rehydratation.
===============================================================================
*/

const HANDLED_EVENTS = Object.freeze(new Map([
    ["click", "handleClick"],
    ["submit", "handleSubmit"],
    ["change", "handleChange"],
    ["app-authentify", "handleAppAuthentify"],
    ["app-calendar-mutation-form-change",
                                    "handleAppCalendarMutationFormChange"],
    ["app-calendar-mutation-form-submit",
                                    "handleAppCalendarMutationFormSubmit"],
]));

const MAX_ALLOWED_DEPTH = 10;

const OPENING_TOKEN = '{';
const CLOSING_TOKEN = '}';

const SECTION_MARKER = '#';
const IF_BLOCK_MARKER = '?';
const ELSE_BLOCK_MARKER = ':';
const TEXT_CONTENT_MARKER = '$';
const INCLUDE_MARKER = '%';
const FLUSH_MARKER = '!';
const PIPE_DELIMITER = '|';
const HARD_CODED_MARKER = '"';
const END_OF_BLOCK = '/';

const UUID_RANGE = 100_000;

const BLANK_PATTERN = /\s\s+/g;


function generateUuid(elementUuids)
{
    for(;;) {
        const elementUuid = ''+Math.round(Math.random() * UUID_RANGE);
        if(!elementUuids.has(elementUuid)) {
            elementUuids.add(elementUuid);
            return elementUuid;
        }
    }
}

function generateTreeFromExpression(template)
{
    const root = {
        children: [],
        symbol: 'root'
    };
    const elementUuids = new Set();
    
    const ancestorChain = [root];
    for(let cursor = 0;cursor < template.length;) {
        if(ancestorChain.length >= MAX_ALLOWED_DEPTH) {
            throw "Template is too deep";
        }
        
        const openingIndex = template.indexOf(OPENING_TOKEN, cursor);
        const plant = ancestorChain.pop();
        if(!plant) {
            throw "Exhausted ancestor chain";
        }
        
        if(openingIndex >= 0) {
            if(cursor + 1 <= openingIndex) {
                const slice = template.substring(
                    cursor, openingIndex
                ).replace(BLANK_PATTERN, ' ');
                emitSlice: {
                    if(slice === ' ') {
                        // Heuristic: do not emit spaces
                        // when they are inside a {#} block.
                        if(plant.symbol == 'uuid') {
                            break emitSlice;
                        } else {
                            for(let N = ancestorChain.length; --N >= 0;) {
                                const ancestor = (
                                    /**
                                     * @type {WithSymbol} Not null by design
                                     */ (ancestorChain[N])
                                );
                                if(ancestor.symbol == 'uuid') {
                                    break emitSlice;
                                }
                            }
                        }
                    }
                    const fragment = {
                        symbol: 'fragment',
                        slice
                    };
                    plant.children.push(fragment);
                }
            }

            const closingIndex = template.indexOf(CLOSING_TOKEN, openingIndex);
            if(closingIndex == -1) {
                let estimatedLineNumber = 0;
                for(const c of template.substring(0, openingIndex)) {
                    if(c == '\n') {
                        estimatedLineNumber += 1;
                    }
                }
                throw `No closing symbol found for opening block; 
                        around line ${estimatedLineNumber}`;
            }
            
            const variable = template.substring(
                openingIndex+OPENING_TOKEN.length+1, closingIndex
            ).trim();
            switch(template[openingIndex+OPENING_TOKEN.length]) {
                case SECTION_MARKER: {
                    const nextPlant = variable
                        ? {
                            symbol: 'section',
                            variable,
                            children: []
                        } : {
                            symbol: 'uuid',
                            elementUuid: generateUuid(elementUuids),
                            children: []
                        };
                    
                    plant.children.push(nextPlant);
                    ancestorChain.push(plant);
                    ancestorChain.push(nextPlant);
                } break;
                case IF_BLOCK_MARKER: {
                    const nextPlant = {
                        symbol: 'if',
                        variable,
                        children: []
                    };
                    plant.children.push(nextPlant);
                    ancestorChain.push(plant);
                    ancestorChain.push(nextPlant);
                } break;
                case ELSE_BLOCK_MARKER: {
                    const nextPlant = {
                        symbol: 'else',
                        variable,
                        children: []
                    };
                    plant.children.push(nextPlant);
                    ancestorChain.push(plant);
                    ancestorChain.push(nextPlant);
                } break;
                case INCLUDE_MARKER: {
                    const leaf = {
                        symbol: 'include',
                        variable
                    };
                    plant.children.push(leaf);
                    ancestorChain.push(plant);
                } break;
                case FLUSH_MARKER: {
                    const leaf = {
                        symbol: 'flush',
                        variable
                    };
                    plant.children.push(leaf);
                    ancestorChain.push(plant);
                } break;
                case TEXT_CONTENT_MARKER: {
                    const leaf = {
                        symbol: 'textContent',
                        variable
                    };
                    plant.children.push(leaf);
                    ancestorChain.push(plant);
                } break;
                case END_OF_BLOCK:
                    break;
                default: {
                    const value = template.substring(
                        openingIndex+OPENING_TOKEN.length, closingIndex
                    ).trim(); // rectify
                    const pipeIndex = value.indexOf(PIPE_DELIMITER);
                    if(pipeIndex == -1) {
                        let estimatedLineNumber = 0;
                        for(const c of template.substring(0, openingIndex)) {
                            if(c == '\n') {
                                estimatedLineNumber += 1;
                            }
                        }
                        throw `No pipe delimiter found,
                            though we reach the end of potential blocks;
                            around line ${estimatedLineNumber}`;
                    }
                    const pipe = value.substring(
                        pipeIndex+PIPE_DELIMITER.length, value.length
                    ).trim();
                    const variable = value.substring(0, pipeIndex).trim();
                
                    let leaf;
                    if(variable.startsWith(HARD_CODED_MARKER)) {
                        const value = variable.substring(
                            1, variable.length
                        ).trim();
                        leaf = {
                            symbol: 'hardAttribute',
                            value, pipe
                        };
                    } else {
                        leaf = {
                            symbol: 'dynamicAttribute',
                            variable, pipe
                        };
                    }

                    plant.children.push(leaf);
                    ancestorChain.push(plant);
                }
            }
            
            cursor = closingIndex + CLOSING_TOKEN.length;
        } else {
            const leaf = {
                symbol: 'fragment',
                slice: template.substring(
                    cursor, template.length
                ).replace(BLANK_PATTERN, ' ')
            };
            plant.children.push(leaf);
            
            cursor = template.length; // loop is over, so break is not required
        }
    }
    
    return root;
}

function btoa(str) {
    return Buffer.from(encodeURI(str)).toString('base64');
}
function processBranch(branch, { templateName, types, slices, Clines, depth, elementUuid }) {
    switch(branch.symbol) {
        case "root": {
            types.add('ROOT');
            for(const child of branch.children) {
                processBranch(child, { templateName, types, slices, Clines, depth: 0 });
            }
        } break;
        case "fragment": {
            const sliceIndex = slices.length;
            Clines.push(`template_emit(${templateName}_${sliceIndex});`);
            slices.push(branch.slice);
        } break;
        case "section": {
            const sectionName = branch.variable.toUpperCase();
            types.add(sectionName);

            depth += 1;
            Clines.push(`{
TMPL_T_${sectionName} n${depth};
for(
 int i${depth} = 1;
 i${depth} < 95 && (n${depth} = n${depth-1} -> ${sectionName.toLowerCase()}(n${depth-1}));
 i${depth}++
) {
            `);
            for(const child of branch.children) {
                processBranch(child, { templateName, types, slices, Clines, depth });
            }
            Clines.push(`} }`);
        } break;
        case "if": {
            const variable = branch.variable;
            Clines.push(`if(!!(n${depth} -> ${variable}(n${depth}))) {`);
            for(const child of branch.children) {
                processBranch(child, { templateName, types, slices, Clines, depth });
            }
            Clines.push(`}`);
        } break;
        case "else": {
            const variable = branch.variable;
            Clines.push(`if(!(n${depth} -> ${variable}(n${depth}))) {`);
            for(const child of branch.children) {
                processBranch(child, { templateName, types, slices, Clines, depth });
            }
            Clines.push(`}`);
        } break;
        case "uuid": {
            const elementUuid = branch.elementUuid;
            Clines.push(`{
    template_id_footprint(id_chunk, "${elementUuid}", ${depth}, ${[...Array(depth).keys()].map(_ => `i${_+1}`).join(', ')});
    assert(string_length(id_chunk) < 50, "ID overflows 50 characters");
    id_chunk[95] = '\\0';
    template_emit_uuid(id_chunk);
}`
            );

            for(const child of branch.children) {
                processBranch(child, { templateName, types, slices, Clines, depth, elementUuid });
            }
        } break;
        case "hardAttribute": {
            const value = branch.value;
            const attribute = branch.pipe;
            if(! elementUuid) {
                throw "Side effect must be identified"
            } else {
                if(attribute == 'class') {
                    if(elementUuid) {
                        Clines.push(`template_emit_class(id_chunk, "${value}");`);
                    }
                } else {
                    Clines.push(`template_emit_attribute(id_chunk, "${attribute}", "${value}");`);
                }
            }
        } break;
        case "dynamicAttribute": {
            const variable = branch.variable;
            const attribute = branch.pipe;
            if(! elementUuid) {
                throw "Side effect must be identified"
            } else {
                if(attribute == 'class') {
                    if(elementUuid) {
                        Clines.push(`template_emit_class(id_chunk, (n${depth} -> ${variable})(n${depth}));`);
                    } else throw "Class attribute out of a id block";
                } else {
                    Clines.push(`template_emit_attribute(id_chunk, "${attribute}", (n${depth} -> ${variable})(n${depth}));`);
                }
            }
        } break;
        case "flush": {
            const variable = branch.variable;
            if(!variable) {
                throw "Variable unset for flush";
            } else {
                Clines.push(`template_emit((n${depth} -> ${variable})(n${depth}));`);
            }
        } break;
        case "include": {
            const variable = branch.variable;
            if(!variable) {
                throw "Variable unset for include";
            } else {
                Clines.push(`(n${depth} -> ${variable})(n${depth});`);
            }
        } break;
        case "textContent":default: {
            throw JSON.stringify(branch);
            break;
        }
    }
}


function checkIfAtLeastOneId(branch) {
    switch(branch.symbol) {
        case "root":
        case "section":
        case "if":
        case "else":
            for(const child of branch.children) {
                if(checkIfAtLeastOneId(child))
                    return true;
            }
            return false;
        case "uuid":
            return true;
        case "fragment":
        case "hardAttribute":
        case "dynamicAttribute":
        case "flush":
        case "include":
        case "textContent":
            return false;
        default:
            throw JSON.stringify(branch);
    }
}


function wrapClines(types, Clines, slices, templateName, atLeastOneId) {
    const id_chunk_preamble = atLeastOneId ? (
`    char id_chunk[96];
#   ifdef NDEBUG
    for(int i = 0; i < 64; i++) id_chunk[i] = '!';
#   endif
`
    ) : '';
    const macroDeclarations = [...types].map(type => (
`
# ifndef TMPL_T_${type}
#    error Symbol \`TMPL_T_${type}\` undefined
# endif
`
    )).join('\n');

    const slice_declarations = slices.map((slice, index) => (
        `static const char* const ${templateName}_${index} = ${JSON.stringify(slice)};`
    )).join("\n");

    return (
`
#include "../template.h"

#include "../shared/assert.h"
#include "../shared/string_length.h"

${macroDeclarations}

${slice_declarations}

static void run(TMPL_T_ROOT n0)
{
${id_chunk_preamble}

${Clines.join(' ')}

}
`
    );
}


function compile(templateName, templateContent) {
    const types = new Set();
    const slices = [];
    const Clines = [];

    const tree = generateTreeFromExpression(templateContent);

    processBranch(tree, { templateName, types, slices, Clines, depth: 0 });

    return wrapClines(types, Clines, slices, templateName, checkIfAtLeastOneId(tree));
}

module.exports = { compile };
