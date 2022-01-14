// add validated-form class to forms to disable submissions if there are invalid fields
(function () {
    "use strict"

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll(".validated-form");

    // Make an array from the forms and loop over them to prevent submission
    Array.from(forms).forEach(function (form) {
        form.addEventListener("submit", function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add("was-validated");
        }, false)
    })
})()