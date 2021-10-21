(function() {
	
	window.addEventListener("location-change", function({ detail }) {
		var currentUrl   = new URL(window.location.href),
		    queryParams  = [...currentUrl.searchParams]
		    				.map(([key, value]) => ({key , value })),
		    [focus]      = ["focus"]
		    					.map    (w => (({ key }) => key == w))
		    					.flatMap(p => queryParams.filter(p))
		    					.map    (({ value }) => value),
		    focusDate    = focus && MyDate.fromFormattedString(focus);

		[...document.querySelectorAll(".focus-on")]
		.forEach(element => element.dispatchEvent(
			new CustomEvent("focus-on", { detail: focusDate })
		));
	});

	window.addEventListener("load", function() {
		window.dispatchEvent(new CustomEvent("location-change", {}));
	});
	window.addEventListener("popstate", function() {
		window.dispatchEvent(new CustomEvent("location-change", {}));
	});

	window.addEventListener("force-location-change", function({ detail }) {
		var url = detail;

		history.pushState({ "reason": "Automatic change from hyperlink click" },
			`Rendez-vous du calendrier`,
			url);
		window.dispatchEvent(new CustomEvent("location-change", {}));
	})

})();
