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
    ["change", "handleChange"]
]));

const MAX_ALLOWED_DEPTH = 10;

const OPENING_TOKEN = '{';
const CLOSING_TOKEN = '}';

const SECTION_MARKER = '#';
const IF_BLOCK_MARKER = '?';
const ELSE_BLOCK_MARKER = ':';
const TEXT_CONTENT_MARKER = '$';
const EVENT_MARKER = '%';
const PIPE_DELIMITER = '|';
const HARD_CODED_MARKER = '"';
const END_OF_BLOCK = '/';

const IDENTIFICATION_ATTRIBUTE = 'data-uuid';
const UUID_RANGE = 100_000;

const BLANK_PATTERN = /\s\s+/g;


/**
 * Generate a unique UUID, from the knowledge of reserved UUIDs.
 * This method is not secure. The resulting UUID is also happened on
 * the Set, which is thus expected to be mutable.
 * 
 * @param {Set<string>} elementUuids - The (mutable) Set of reserved UUID
 * @returns {string} - The generated UUID
 * ----------------------------------------------------------------------------
 */
function generateUuid(elementUuids)
{
    for(;;) {
        const elementUuid = 'uuid'+Math.round(Math.random() * UUID_RANGE);
        if(!elementUuids.has(elementUuid)) {
            elementUuids.add(elementUuid);
            return elementUuid;
        }
    }
}

/**
 * @typedef {(Root & Branch)                        |
 *           (Section & Branch)                     |
 *           (InnerIdentificationSection & Branch)  |
 *           (IfBlock & Branch)                     |
 *           (ElseBlock & Branch)                   |
 *           TextContentDirective                   |
 *           EventDirective                         |
 *           DynamicAttributeDirective              |
 *           HardAttributeDirective                 |
 *           MarkupFragment
 * } Plant - Plant is the union of all possible plant kinds
 * 
 * @typedef {Object} Branch - A branch must have space for children
 * @property {Array<Plant>} children - Ordered sequence of subplants
 * 
 * @typedef {Object} WithSymbol - A branch must have space for children
 * @property {( 'section'     |
 *              'uuid'        |
 *              'root'        |
 *              'if'          |
 *              'else'        |
 *              'textContent' |
 *              'event'       |
 *              'attribute'   |
 *              'fragment'    )} symbol - Ordered list of subplants
 * 
 * @typedef {Object} Root 
 * @property {('root')} symbol
 * 
 * @typedef {Object} Section
 * @property {('section')} symbol 
 * @property {string} variable
 * 
 * @typedef {Object} InnerIdentificationSection
 * @property {('uuid')} symbol 
 * @property {string} elementUuid
 * 
 * @typedef {Object} IfBlock
 * @property {('if')} symbol 
 * @property {string} variable
 * 
 * @typedef {Object} ElseBlock
 * @property {('else')} symbol 
 * @property {string} variable
 * 
 * @typedef {Object} TextContentDirective
 * @property {('textContent')} symbol 
 * @property {string} variable
 * 
 * @typedef {Object} EventDirective
 * @property {('event')} symbol 
 * @property {string} variable
 * 
 * @typedef {Object} DynamicAttributeDirective
 * @property {('dynamicAttribute')} symbol 
 * @property {string} variable
 * @property {string} pipe
 * 
 * @typedef {Object} HardAttributeDirective
 * @property {('hardAttribute')} symbol 
 * @property {string} value
 * @property {string} pipe
 * 
 * @typedef {Object} MarkupFragment
 * @property {('fragment')} symbol 
 * @property {string} slice
 */


/**
 * Generate a Plant from the template string. The Plant precomputes blocks
 * and prepare them to be rendered. This method is at the core of the
 * templating parsing. It parses the string and creates a tree of nodes that
 * represents actions to perform.
 * 
 * The method also takes into account UUID automatic generation for identified
 * sections of the template.
 * 
 * @param {string} template - The source template string
 * @param {Set<string>} reservedUuids - Collection of forbidden UUIDs
 * @returns {Root & Branch} - The template root
 * ----------------------------------------------------------------------------
 */
function generateTreeFromExpression(template, reservedUuids)
{
    /** @type {Branch & Root} */
    const root = {
        children: [],
        symbol: 'root'
    };
    const elementUuids = new Set(reservedUuids);
    
    /**
     * @type {Array<WithSymbol & Branch>}
     */
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
            if(cursor + 1 < openingIndex) {
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
                                if(ancestorChain[N].symbol == 'uuid') {
                                    break emitSlice;
                                }
                            }
                        }
                    }

                    /**
                     * @type {MarkupFragment}
                     */
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
                    /**
                     * @type {(Section | InnerIdentificationSection) & Branch}
                     */
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
                    /**
                     * @type {IfBlock & Branch}
                     */
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
                    /**
                     * @type {ElseBlock & Branch}
                     */
                    const nextPlant = {
                        symbol: 'else',
                        variable,
                        children: []
                    };
                    plant.children.push(nextPlant);
                    ancestorChain.push(plant);
                    ancestorChain.push(nextPlant);
                } break;
                case EVENT_MARKER: {
                    /**
                     * @type {EventDirective}
                     */
                    const leaf = {
                        symbol: 'event',
                        variable
                    };
                    plant.children.push(leaf);
                    ancestorChain.push(plant);
                } break;
                case TEXT_CONTENT_MARKER: {
                    /**
                     * @type {TextContentDirective}
                     */
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
                    
                    /**
                     * @type {HardAttributeDirective|DynamicAttributeDirective}
                     */
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
            /**
             * @type {MarkupFragment}
             */
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

/**
 * @callback DOMEffect
 * @param {*} _
 */

/**
 * @typedef {{
 *  kind: 0,
 *  fragment: string
 * }} FragmentEmission
 * @typedef {{
 *  kind: 1,
 *  identifier: string
 * }} IdentifierEmission
 * @typedef {{
 *  kind: 2,
 *  identifier: string,
 *  sideEffect: DOMEffect,
 *  cancelEffect: DOMEffect
 * }} SideEffectEmission
 * @typedef {FragmentEmission   |
 *           IdentifierEmission |
 *           SideEffectEmission
 * } TemplateSegment
 * @typedef {IteratorResult<TemplateSegment,null>} IteratedTemplateSegment
 */

/**
 * 
 * @param {Plant} plant
 * @param {*} [scope]
 * @returns {Iterator<TemplateSegment>} 
 */
function plantToProcessor(plant, scope)
{
    switch(plant.symbol) {
        case 'fragment':
            return new SingleEmission({
                kind: 0,
                fragment: plant.slice
            });
        case 'root':
            throw `Root must be handled differently,
                as it returns string or side effects`;
        case 'uuid':
            return new InnerIdentificationSectionProcessor(plant, scope);
        case 'textContent': {
            const variable = plant.variable;
            if(!scope || !Object.hasOwn(scope, variable)) {
                throw `Scope is undefined or does not exhibit
                    the expected handler for event ${variable}`;
            } else {
                const textContent = scope[variable];
                if(textContent) {
                    return new SingleEmission({
                        kind: 2,
                        identifier: '',
                        sideEffect: _ => (_.textContent = textContent),
                        cancelEffect: _ => (_.textContent = '')
                    });
                } else {
                    return new EmptyProcessor();
                }
            }
        }
        case 'hardAttribute':
        case 'dynamicAttribute': {
            const attribute = plant.pipe;
    
            /**
             * @type{string}
             */
            let value;
            if(plant.symbol == 'dynamicAttribute') {
                const variable = plant.variable;
                if( scope
                    && Object.hasOwn(scope, variable)
                    && scope[variable]
                ) {
                    value = scope[variable];
                } else {
                    throw `Scope is undefined or does not exhibit
                        the expected variable ${variable}`;
                }
            } else {
                value = plant.value;
            }
    
            if(attribute === 'class') {
                return value != null
                    ? new SingleEmission({
                        kind: 2,
                        identifier: '',
                        sideEffect: _ => _.classList.add(value),
                        cancelEffect: _ => _.classList.remove(value)
                    }) : new EmptyProcessor();
            } else {
                return value != null
                    ? new SingleEmission({
                        kind: 2,
                        identifier: '',
                        sideEffect: _ => _.setAttribute(attribute, value),
                        cancelEffect: _ => _.removeAttribute(attribute)
                    }) : new EmptyProcessor();
            }
        }
        case 'event': {
            const variable = plant.variable;
            const attribute = HANDLED_EVENTS.get(variable);
            if(!scope || !attribute || !Object.hasOwn(scope, attribute)) {
                throw `Scope is undefined or does not exhibit
                    the expected handler for event ${variable}`;
            }
            const handler = scope[attribute];
            
            return new SingleEmission({
                kind: 2,
                identifier: '',
                sideEffect: _ => _.addEventListener(variable, handler),
                cancelEffect: _ => _.removeEventListener(variable, handler)
            });
        }
        case 'section':
        case 'if':
        case 'else': {
            if(!scope || !Object.hasOwn(scope, plant.variable)) {
                throw `Scope is undefined or does not exhibit
                    the expected variable ${plant.variable}`;
            } else {
                const scopeValue = scope[plant.variable];
                switch(plant.symbol) {
                    case 'section':
                        if(scopeValue) {
                            const iterator = scopeValue[Symbol.iterator];
                            if(typeof iterator === 'function') {
                                return new SectionProcessor(
                                    plant, iterator()
                                );
                            } else {
                                return new BranchProcessor(plant, scopeValue);
                            }
                        } else {
                            return new EmptyProcessor();
                        }
                    case 'if':
                        if(scopeValue) {
                            return new BranchProcessor(plant, scope, 't');
                        } else {
                            return new EmptyProcessor();
                        }
                    case 'else':
                        if(scopeValue) {
                            return new EmptyProcessor();
                        } else {
                            return new BranchProcessor(plant, scope, 'f');
                        }
                }
            }
        } break;
        default: throw "Plant processor cannot be used in provided context";
    }
}

class EmptyProcessor
{
    /**
     * @returns {IteratedTemplateSegment}
     */
    next = () => ({ done: true, value: null });
}
class BranchProcessor
{
    /**
     * @constructor
     * @param {Branch} plant 
     * @param {*} [scope] 
     * @param {string} [prefix]
     */
    constructor(plant, scope, prefix)
    {
        this.scope = scope;
        this.prefix = prefix;
        this.children = plant.children;
        this.readCursor = 0;
        /**
         * @type {Iterator<TemplateSegment>}
         */
        this.delegation = new EmptyProcessor();
    }

    /**
     * @returns {IteratedTemplateSegment}
     */
    next = () => {
        for(;;) {
            const { done, value } = this.delegation.next();
            if(!done) {
                if(this.prefix) {
                    if(value.kind == 1 || value.kind == 2) {
                        const identifier = [
                            this.prefix,
                            value.identifier
                        ].filter(Boolean).join('_');
                        return {
                            value: {
                                ...value,
                                identifier
                            }
                        };
                    }
                }
                return { value };
            }
            else {
                if(this.readCursor < this.children.length) {
                    this.delegation = plantToProcessor(
                        this.children[this.readCursor++],
                        this.scope
                    );
                } else {
                    break;
                }
            }
        }
        return { done: true, value: null };
    };
}
class InnerIdentificationSectionProcessor
{
    /**
     * @constructor
     * @param {*} [scope]
     * @param {InnerIdentificationSection & Branch} plant
     */
    constructor(plant, scope) {
        this.elementUuid = plant.elementUuid;
        this.identificationSent = false;
        this.delegation = new BranchProcessor(plant, scope);
    }

    /**
     * @returns {IteratedTemplateSegment}
     */
    next = () => {
        if(!this.identificationSent) {            
            this.identificationSent = true;
            return {
                value: {
                    kind: 1,
                    identifier: this.elementUuid
                }
            };
        } else {
            for(;;) {
                const { done, value } = this.delegation.next();
                if(done) {
                    return { done, value: null };
                } else {
                    if(value.kind == 2) {
                        return {
                            value: {
                                kind: 2,
                                identifier: this.elementUuid,
                                sideEffect: value.sideEffect,
                                cancelEffect: value.cancelEffect
                            }
                        };
                    } else {
                        throw `Unexpected value emission of kind ${value.kind}
                            inside of identifier block ${this.elementUuid}`;
                    }
                }
            }
        }
    };
}
class SectionProcessor {
    /**
     * @constructor
     * @param {Branch} plant 
     * @param {Generator<*,*,*>} generator
     */
    constructor(plant, generator) {
        this.plant = plant;
        this.generator = generator;

        /**
         * @type {BranchProcessor?}
         */
        this.delegation = null;
        this.counter = -1;
    }

    /**
     * @returns {IteratedTemplateSegment}
     */
    next = () => {
        if(this.delegation) {
            const { done, value } = this.delegation.next();
            if(!done) {
                return { value };
            }
        }

        // Otherwise, delegation is exhausted or was never defined
        for(;;) {
            const baseGeneratorEmission = this.generator.next();
            if(baseGeneratorEmission.done) {
                return { done: true, value: null };
            } else {
                this.counter += 1;
                this.delegation = new BranchProcessor(
                    this.plant,
                    baseGeneratorEmission.value,
                    String(this.counter)
                );
                const { done, value } = this.delegation.next();
                if(!done) {
                    return { value };
                }
                else {
                    continue;
                }
            }
        }
    };
}

class SingleEmission {
    /**
     * @constructor
     * @param {TemplateSegment} segment
     */
    constructor(segment) {
        this.segment = segment;
        this.done = false;
    }

    /**
     * @returns {IteratedTemplateSegment}
     */
    next = () => {
        if(this.done) {
            return { done: true, value: null };
        } else {
            this.done = true;
            return { value: this.segment };
        }
    };
}

class RootProcessor {
    /**
     * @constructor
     * @param {Root & Branch} plant
     * @param {*} scope
     */
    constructor(plant, scope) {
        this.delegation = new BranchProcessor(plant, scope);
    }

    /**
     * @returns {IteratorResult<string | SideEffectEmission, undefined>}
     */
    next = () => {
        const { done, value } = this.delegation.next();
        if(done) {
            return { done, value: undefined };
        } else {
            if(value.kind === 0) {
                return { value: value.fragment };
            } else {
                const identifier = `id${value.identifier}`;
                if(value.kind === 1) {
                    return {
                        value: ` ${IDENTIFICATION_ATTRIBUTE}="${identifier}" `
                    };
                } else {
                    return {
                        value: {
                            ...value,
                            identifier: identifier
                        }
                    };
                }
            }
        }
    };

    [Symbol.iterator] = () => this;
}


/**
 * @param {string} template 
 * @param {Set<string>} reservedUuids 
 * @returns 
 */
function compile(template, reservedUuids) {
    /**
     * @type {Root & Branch}
     */
    const root = generateTreeFromExpression(template, reservedUuids);
    
    /**
     * @param {*} domRoot 
     * @param {*} scope 
     * @yields {undefined}
     * @returns {*}
     */
    const Hydrate = function* (domRoot, scope)
    {
        const sideEffects = new Map();
        
        /* hydratation not done yet */
        {
            const htmlFragments = [];
            for(const item of new RootProcessor(root, scope)) {
                if(typeof item === 'string') {
                    htmlFragments.push(item);
                } else {
                    const { identifier, sideEffect, cancelEffect } = item;
                    if(! sideEffects.has(identifier)) {
                        sideEffects.set(identifier, []);
                    }
                    sideEffects.get(identifier).push(
                        { sideEffect, cancelEffect }
                    );
                }
            }
            domRoot.innerHTML = htmlFragments.join("");
        }
        
        for(;;) {
            // Start of the loop, we know the DOM is ready
            // and sideEffects map is filled but not applied yet
            
            // STEP 1: Perform the side effects
            for(const [identifier, effects] of sideEffects) {
                const element = domRoot.querySelector(
                    `*[${IDENTIFICATION_ATTRIBUTE}=${identifier}]`
                );
                for(const pair of effects) {
                    pair.sideEffect(element);
                    delete pair.sideEffect;
                }
            }
            
            // STEP 2: yield nothing and wait for next scope to show up
            const nextScope = yield;
            
            // STEP 3: perform clean
            for(const [identifier, effects] of sideEffects) {
                const element = domRoot.querySelector(
                    `*[${IDENTIFICATION_ATTRIBUTE}=${identifier}]`
                );
                for(;;) {
                    const effect = effects.pop();
                    if(effect) {
                        effect.cancelEffect(element);
                    } else {
                        break;
                    }
                }
            }
            
            if(!nextScope) {
                // STEP 4b: when no scope, we stop
                break;
            } else {
                // STEP 4: Iterate on the scope again,
                // populate the effects map again
                for(const item of new RootProcessor(root, nextScope)) {
                    if(typeof item === 'string') {
                        continue;
                    } else {
                        const { identifier, sideEffect, cancelEffect } = item;
                        if(!sideEffects.has(identifier)) {
                            sideEffects.set(identifier, []);
                        }
                        sideEffects.get(identifier).push(
                            { sideEffect, cancelEffect }
                        );
                    }
                }
            }
        }
    };
    return Hydrate;
}

export { compile };