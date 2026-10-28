
const form = document.querySelector("#multiStepForm");
const steps = document.querySelectorAll(".form-step");
const nextButtons = document.querySelectorAll(".next-btn");
const prevButtons = document.querySelectorAll(".prev-btn");

const progress = document.querySelector("#progress");
const stepText = document.querySelector("#stepText");
const progressPercent = document.querySelector("#progressPercent");
const summary = document.querySelector("#summary");
const successMessage = document.querySelector("#successMessage");

const storageKey = "multiStepFormData";

let currentStep = 0;

const fields = ["name", "email", "address", "city"];

function saveFormData() {
    const data = {};

    fields.forEach((field) => {
        data[field] = document.getElementById(field).value;
    });

    try {
        localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
        console.warn("Autosave is unavailable in this browser.");
    }
}

function loadFormData() {
    try {
        const savedData = localStorage.getItem(storageKey);

        if (!savedData) return;

        const data = JSON.parse(savedData);

        fields.forEach((field) => {
            if (typeof data[field] === "string") {
                document.getElementById(field).value = data[field];
            }
        });
    } catch (error) {
        console.warn("Saved form data could not be loaded.");
    }
}

function validateStep(stepIndex) {
    const currentFields = steps[stepIndex].querySelectorAll("input");
    const errorMessage = steps[stepIndex].querySelector(".error-message");

    errorMessage.textContent = "";

    for (const input of currentFields) {
        if (!input.checkValidity()) {
            errorMessage.textContent =
                input.validity.valueMissing
                    ? `Please fill in ${input.labels[0].textContent}.`
                    : `Please enter a valid ${input.labels[0].textContent}.`;

            input.focus();
            return false;
        }
    }

    return true;
}

function updateProgress() {
    const percent = Math.round(((currentStep + 1) / steps.length) * 100);

    progress.style.width = `${percent}%`;
    stepText.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    progressPercent.textContent = `${percent}%`;
}

function showSummary() {
    summary.replaceChildren();

    fields.forEach((field) => {
        const paragraph = document.createElement("p");
        const label = document.createElement("strong");

        label.textContent =
            document.querySelector(`label[for="${field}"]`).textContent + " ";

        paragraph.append(
            label,
            document.getElementById(field).value.trim()
        );

        summary.appendChild(paragraph);
    });
}

function showStep(stepIndex) {
    steps.forEach((step, index) => {
        step.classList.toggle("active", index === stepIndex);
    });

    currentStep = stepIndex;
    updateProgress();

    if (currentStep === steps.length - 1) {
        showSummary();
    }
}

nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (!validateStep(currentStep)) return;

        saveFormData();

        if (currentStep < steps.length - 1) {
            showStep(currentStep + 1);
        }
    });
});

prevButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        }
    });
});

fields.forEach((field) => {
    document.getElementById(field).addEventListener("input", () => {
        saveFormData();

        const errorMessage =
            document.getElementById(field)
                .closest(".form-step")
                .querySelector(".error-message");

        errorMessage.textContent = "";
    });
});

form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateStep(currentStep)) return;

    saveFormData();

    form.querySelectorAll(".form-step").forEach((step) => {
        step.hidden = true;
    });

    successMessage.hidden = false;

    try {
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.warn("Saved data could not be cleared.");
    }
});

loadFormData();
showStep(currentStep);
