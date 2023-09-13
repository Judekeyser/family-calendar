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
 * @param {boolean} readOnlySet - Tells if the set can be mutated or not.
 * @returns {Root & Branch} - The template root
 * ----------------------------------------------------------------------------
 */
function generateTreeFromExpression(template, reservedUuids, readOnlySet)
{
    if(readOnlySet) {
        return generateTreeFromExpression(
            template,
            new Set(reservedUuids),
            false
        );
    }
    /** @type {Branch & Root} */
    const root = {
        children: [],
        symbol: 'root'
    };
    const elementUuids = reservedUuids;
    
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
 * @param {HTMLElement} _
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
 * @param {string} identifier
 * @param {DOMEffect} sideEffect
 * @param {DOMEffect} cancelEffect
 * @returns {SideEffectEmission}
 */
function asDOMEffect(identifier, sideEffect, cancelEffect) {
    return {
        kind: 2,
        identifier,
        sideEffect,
        cancelEffect
    };
}

/**
 * @param {string} fragment
 * @returns {FragmentEmission}
 */
function asFragment(fragment) {
    return {
        kind: 0,
        fragment
    };
}

/**
 * @param {string} identifier
 * @returns {IdentifierEmission}
 */
function asIdentification(identifier) {
    return {
        kind: 1,
        identifier
    };
}



/**
 * @param {Object.<string, unknown>} scope - Scope to access property from
 * @param {string | undefined} property - The property to access
 * @returns {unknown}
 */
function _getProperty(scope, property) {
    if(!property) {
        throw `Provided property is undefined-- giving up`;
    }
    else if(!scope) {
        throw `Provided scope is undefined (propery ${property}) - giving up`;
    }
    else if(!Object.hasOwn(scope, property)) {
        throw `Scope does not exhibit expected property ${property}`;
    }
    else {
        return scope[property];
    }
}

/**
 * @generator
 * @param {Plant} plant - The plant to process
 * @param {Object.<string,unknown>} scope - Scope holding template data
 * @yields {TemplateSegment}
 * @returns {IterableIterator<TemplateSegment>}
 */
function* it(plant, scope) {
    switch(plant.symbol) {
        case "fragment": {
            yield asFragment(plant.slice);
        } break;
        case "uuid": {
            const uuid = plant.elementUuid;
            yield asIdentification(uuid);
            for(const child of plant.children) {
                for(const emission of it(child, scope)) {
                    if(emission.kind == 2) {
                        yield asDOMEffect(
                            uuid,
                            emission.sideEffect,
                            emission.cancelEffect
                        );
                    } else {
                        yield emission;
                    }
                }
            }
        } break;
        case "dynamicAttribute": {
            const attributeName = plant.pipe;
            const value = _getProperty(scope, plant.variable) || '';

            if(!['string', 'boolean', 'number'].includes(typeof value)) {
                throw `Property ${plant.variable} used as dynamic attribute `
                    + `must be a a primitive`;
            } else {
                const strValue = String(value);
                if(attributeName == "class") {
                    yield asDOMEffect(
                        '',
                        _ => _.classList.add(strValue),
                        _ => _.classList.remove(strValue)
                    );
                } else {
                    yield asDOMEffect(
                        '',
                        _ => _.setAttribute(attributeName, strValue),
                        _ => _.removeAttribute(attributeName)
                    );
                }
            }
        } break;
        case "hardAttribute": {
            const attributeName = plant.pipe;
            const value = plant.value;

            if(attributeName == "class") {
                yield asDOMEffect(
                    '',
                    _ => _.classList.add(value),
                    _ => _.classList.remove(value)
                );
            } else {
                yield asDOMEffect(
                    '',
                    _ => _.setAttribute(attributeName, value),
                    _ => _.removeAttribute(attributeName)
                );
            }
        } break;
        case "textContent": {
            const textContent = _getProperty(scope, plant.variable) || '';
            if(!["string", "number"].includes(typeof textContent)) {
                throw `Property ${plant.variable} used for textContent `
                    + `must be a string`;
            } else {
                yield asDOMEffect(
                    '',
                    _ => (_.textContent = String(textContent)),
                    _ => (_.textContent = '')
                );
            }
        } break;
        case "event": {
            const channel = plant.variable;
            const property = HANDLED_EVENTS.get(channel);
            const handler = _getProperty(scope, property);
            if(handler) {
                if(typeof handler != 'function') {
                    throw `Property ${property} used as event handler `
                        + `must be a function`;
                } else {
                    yield asDOMEffect(
                        '',
                        _ => _.addEventListener(
                            channel,
                            /** @type {EventListener} */ (handler)
                        ),
                        _ => _.removeEventListener(
                            channel,
                            /** @type {EventListener} */ (handler)
                        )
                    );
                }
            }
        } break;
        case "if": {
            const flag = !!_getProperty(scope, plant.variable);
            if(flag) {
                for(const child of plant.children) {
                    yield* it(child, scope);
                }
            }
        } break;
        case "else": {
            const flag = !_getProperty(scope, plant.variable);
            if(flag) {
                for(const child of plant.children) {
                    yield* it(child, scope);
                }
            }
        } break;
        case "section": {
            const value = (
                /**
                 * @type {*}
                 */ (_getProperty(scope, plant.variable))
            );
            if(value) {
                if(typeof value[Symbol.iterator] == 'function') {
                    let index = 0;
                    for(const subScope of value) {
                        for(const child of plant.children) {
                            for(const emission of it(child, subScope)) {
                                if(emission.kind == 0) {
                                    yield emission;
                                } else {
                                    const newIdentifier = (
                                        `${emission.identifier}_${index}`
                                    );
                                    if(emission.kind == 2) {
                                        yield asDOMEffect(
                                            newIdentifier,
                                            emission.sideEffect,
                                            emission.cancelEffect
                                        );
                                    } else if(emission.kind == 1) {
                                        yield asIdentification(
                                            newIdentifier
                                        );
                                    }
                                }
                            }
                        }
                        index += 1;
                    }
                } else {
                    for(const child of plant.children) {
                        yield* it(child, value);
                    }
                }
            }
        } break;
        default: throw `Unsupported plant symbol ${plant.symbol}`;
    }
}

/**
 * The `prefix` attribute will be prefixed on every element that requires to
 * be identified. This can be used by components to enforce a kind of
 * uniqueness they can control, in case they want to reuse the same compiled
 * template in different contexts.
 * 
 * @param {string} template
 * @returns 
 */
function compile(template)
{
    /**
     * @type {Root & Branch}
     */
    const root = generateTreeFromExpression(
        template, new Set(), false
    );
    
    /**
     * @param {*} domRoot 
     * @param {*} scope 
     * @param {string} prefix
     * @yields {undefined}
     * @returns {*}
     */
    const Hydrate = function* (domRoot, scope, prefix)
    {
        const sideEffects = new Map();        
        /* hydratation not done yet */
        {
            const htmlFragments = [];
            for(const plant of root.children) {
                for(const emission of it(plant, scope)) {
                    if(emission.kind == 0) {
                        htmlFragments.push(emission.fragment);
                    } else {
                        const identifier = `id${prefix}_${emission.identifier}`;
                        if(emission.kind == 1) {
                            htmlFragments.push(
                                ` ${IDENTIFICATION_ATTRIBUTE}="${identifier}" `
                            );
                        } else {
                            if(!sideEffects.has(identifier)) {
                                sideEffects.set(identifier, []);
                            }
                            sideEffects.get(identifier).push({
                                sideEffect: emission.sideEffect,
                                cancelEffect: emission.cancelEffect
                            });
                        }
                    }
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
            
            /*
            IMPORTANT NOTE:
            ---------------
                With the use of DOMPurify, some elements are removed and
                replaced by their textual values. For example, this directive
                    <app-foo {#}{" bar | bar}{/}></app-foo>
                used to be rendered as
                    <app-foo></app-foo>
                with an additional side-effect
                    setAttribute("bar", "bar");

                With the introduction of DOMPurify, the above is still true
                but *then* the DOM fragment is cleaned and the result actually
                becomes
                    "bar"
                (taking as asusmption <app-foo> simply prints its content
                without further action).

                This effect might not be desired at all. For example,
                if the custom element is meant to be kept alive, maybe it should
                not get removed out of the DOM.

                We therefore *do not* process DOMPurify here, but we
                delegate on another compilation unit that abandon rehydratation
                and other features custom elements might offer.

                It is always possible to mix both approaches and do something
                more secure, but this would be opinionated and we prefer to
                expose a reusable piece, than making a decision that might
                cost us later.
            */


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
                for(const plant of root.children) {
                    for(const emission of it(plant, scope)) {
                        if(emission.kind == 2) {
                            const identifier = (
                                `id${prefix}_${emission.identifier}`
                            );
                            if(!sideEffects.has(identifier)) {
                                sideEffects.set(identifier, []);
                            }
                            sideEffects.get(identifier).push({
                                sideEffect: emission.sideEffect,
                                cancelEffect: emission.cancelEffect
                            });
                        }
                    }
                }
            }
        }
    };
    return Hydrate;
}


/**
 * This method is a variation of `compile`, where we compile only
 * once without allowing rehydratation. The resulting DOM, however, is
 * purified using DOMPurify.
 * 
 * This method fails if DOMPurify is not available.
 * 
 * The result might contain an extra `div` container.
 * 
 * @param {string} template 
 * @returns {HydrateMethod}
 */
function safeCompileOnce(template)
{
    const DOMPurify = (
        /**
         * @type {*} - DOMPurify interface
         */ (window)
    ).DOMPurify;
    if(!DOMPurify) {
        throw "DOMPurify library is required to use this method.";
    } else {
        const BaseHydrate = compile(template);

        /**
         * @type {HydrateMethod}
         */
        const Hydrate = (domRoot, scope, prefix) => {
            const phantom = document.createElement("div");
            BaseHydrate(phantom, scope, prefix).next();

            /**
             * @callback DOMPredicate
             * @param {string} name
             * @returns {boolean}
             */

            DOMPurify.sanitize(phantom, {
                IN_PLACE: true,
                CUSTOM_ELEMENT_HANDLING: {
                    // allow all tags starting with "app-"
                    tagNameCheck: (/** @type {DOMPredicate} */(
                        (tagName) => !!tagName.match(/^app-/)
                    )), 
                    // allow all containing "baz"
                    attributeNameCheck: (/** @type {DOMPredicate} */(
                        () => true
                    )),// allow customized built-ins
                    allowCustomizedBuiltInElements: true, 
                }
            });
            domRoot.innerHTML = "";
            domRoot.appendChild(phantom);

            return undefined;
        };

        return Hydrate;
    }
}


const Templates =
{
    __compiledTemplates: new Map(),
    /**
     * Get a template from its ID. This method performs a DOM look-up
     * to extract the corresponding template text, and stores the compile
     * result in memoized map.
     * 
     * @param {string} templateId 
     * @returns {HydrateMethod}
     * ------------------------------------------------------------------------
     */
    getTemplate: function(templateId)
    {
        const memo = this.__compiledTemplates;
        if(!memo.has(templateId)) {
            const getAppTemplate = (
                /**
                 * @type {*}
                 */ (window)
            )["getAppTemplate"];
            const templateString = (
                /**
                 * @type {string}
                 */
                (getAppTemplate(templateId))
            );
            const templateFunction = safeCompileOnce(templateString);
            memo.set(templateId, templateFunction);
        }
        return memo.get(templateId);
    }
};


/**
 * Get a template from its ID. This method performs a DOM look-up
 * to extract the corresponding template text, and stores the compile
 * result in memoized map.
 * ------------------------------------------------------------------------
 */

/**
 * @type {TemplateGetter}
 */
function getTemplate(templateId) {
    return Templates.getTemplate(templateId);
}


export { getTemplate };