document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("lab-search");
    const suggestions = document.getElementById("search-suggestions");

    const labs = [
        "G404A",
        "G404B",
        "V101"
    ];

    searchInput.addEventListener("input", function(){

        const value = searchInput.value.toUpperCase();
        suggestions.innerHTML = "";

        if(value === ""){
            suggestions.style.display = "none";
            return;
        }

        const matches = labs.filter(lab => lab.startsWith(value));

        if(matches.length === 0){
            suggestions.style.display = "none";
            return;
        }

        matches.forEach(lab => {

            const item = document.createElement("div");
            item.classList.add("suggestion-item");
            item.textContent = lab;

            item.addEventListener("click", function(){

                searchInput.value = lab;
                suggestions.style.display = "none";

                window.location.href = "/reservation/" + lab;
            });

            suggestions.appendChild(item);

        });

        suggestions.style.display = "block";

    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function(e){
        if(!document.querySelector(".search-box").contains(e.target)){
            suggestions.style.display = "none";
        }
    });

});
