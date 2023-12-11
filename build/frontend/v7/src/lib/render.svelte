<script>
    function objectEquals(a, b) {
        if((typeof(a) === 'object' || typeof(b) === 'object') && (a && b)) {
            if(!Array.isArray(a) && !Array.isArray(b)) {
                const aEntries = new Map(Object.entries(a));
                const bEntries = new Map(Object.entries(b));
                test: {
                    if (aEntries.size === bEntries.size) {
                        for (const [key, value] of aEntries.entries()) {
                            if (!bEntries.has(key) || !objectEquals(bEntries.get(key), value)) {
                                break test;
                            }
                        }
                        return true;
                    }
                }
                return false;
            } else if(Array.isArray(a) && Array.isArray(b)) {
                test: {
                    if(a.length === b.length) {
                        for(let i = 0; i < a.length; i++) {
                            if(!objectEquals(a[i], b[i])) {
                                break test;
                            }
                        }
                        return true;
                    }
                }
                return false;
            }
        } else {
            return a === b;
        }
    }
    function navigate(url) {
        window.dispatchEvent(new CustomEvent("app-history-change", { detail: url }));
    }
    function urlPatch(url, keyValues) {
        console.log(keyValues, url);
        const copy = new URLSearchParams(url ? [...url] : []);
        for(const [key, value] of keyValues) {
            copy.set(key, value);
        }
        return copy;
    }

    export let url = null;
    export let state = null;
    export let initial = true;

    $: {
    }
</script>

<pre>{ JSON.stringify(state, undefined, "  ") }</pre>

<style></style>
