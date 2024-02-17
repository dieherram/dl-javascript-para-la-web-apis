let economicIndicators;
const clpAmount = document.querySelector("input");
const selectValue = document.querySelector("#selectValue");
const calculateValue = document.querySelector("button");
const calculatedConversion = document.querySelector("span");
const errorMessageText = document.querySelector("#error");

// Crear arreglo con indicadores obtenidos desde "mindicador.cl"
const nationalCurrencysToAnArray = async () => {
    try {
        let res = await fetch("https://mindicador.cl/api");
        const dataIndicators = await res.json();
        const currencysToAnArray = Object.keys(dataIndicators);
        const currencysArray = currencysToAnArray.slice(3);
        return currencysArray;
    } catch (e) {
        errorMessage(e.message);
    }
};

// Asignar los indicadores obtenidos mediante "nationalCurrencysToAnArray()" a la variable "economicIndicators" antes de ejecutar "economicIndicatorsToSelect()"
const setCurrencysToEconomicIndicators = async () => {
    try {
        economicIndicators = await nationalCurrencysToAnArray();
        economicIndicatorsToSelect();
    } catch (e) {
        errorMessage(e.message);
    }
};

// Insertar opciones "<option>" y valores dentro de "<select>"
const economicIndicatorsToSelect = () => {
    economicIndicatorsValues = "";
    economicIndicators.forEach((economicIndicator) => {
        economicIndicatorsValues += `
        <option value="${economicIndicator}">${economicIndicator}</option>
        `;
    });
    selectValue.innerHTML = economicIndicatorsValues;
    clpAmount.value = "";
};

// Validar que valor ingresado a "<input>" corresponda a números
const inputValueValidation = () => {
    const valueToValidate = Number(clpAmount.value)
    if (isNaN(valueToValidate) === false && valueToValidate > 0) {
        deleteErrorsMessages()
        getUserSelectedValues(valueToValidate)
    } else {
        deleteErrorsMessages()
        errorMessage('Verificar el monto agregado, este debe ser numérico y mayor a 0')
    }
}

// Eliminar elementos del contenedor de errores "<ul>" asignado a variable "errorMessageText" como también "<li>" que guardan los mensajes "errorMessageContainer"
const deleteErrorsMessages = () => {
    errorMessageContainer = ""
    errorMessageText.innerHTML = ""
}

// Obtener valor desde "<input>" y ejecutar funciones que calculan la conversión y crean grafico
const getUserSelectedValues = (userValue) => {
    const currency = selectValue.value;
    calculateCurrencyConversion(userValue, currency);
    renderGraph(currency);
};

// Calcular conversión y renderizar en DOM
const calculateCurrencyConversion = async (amount, currency) => {
    try {
        let res = await fetch(`https://mindicador.cl/api/${currency}`);
        const dataIndicators = await res.json();
        const resultValue = parseFloat(
            (amount / dataIndicators.serie[0].valor).toFixed(3)
        );
        calculatedConversion.innerText = `$ ${resultValue}`;
    } catch (e) {
        errorMessage(e.message);
    }
};

// Obtener datos que serán utilizados en el grafico
const forexChart = async (currency) => {
    try {
        let res = await fetch(`https://mindicador.cl/api/${currency}`);
        const dataIndicators = await res.json();

        const lastTenDaysDate = dataIndicators.serie.slice(0, 10).reverse();
        const xAxislabels = lastTenDaysDate.map((date) => {
            return date.fecha;
        });

        const lastTenDaysCurrency = dataIndicators.serie.slice(0, 10).reverse();
        const yAxislabels = lastTenDaysCurrency.map((value) => {
            return Number(value.valor);
        });

        const datasets = [
            {
                label: "Historial últimos 10 días",
                borderColor: "#71c4ef",
                data: yAxislabels,
            },
        ];
        return { xAxislabels, datasets };
    } catch (e) {
        errorMessage(e.message);
    }
};

// Renderizar grafico en DOM
const renderGraph = async (currency) => {
    try {
        const data = await forexChart(currency);
        const config = {
            type: "line",
            data: {
                labels: data.xAxislabels,
                datasets: data.datasets,
            },
        };
        const myChart = document.querySelector("#myChart");
        // Evaluar si “myChart” contiene la propiedad "chart" para eliminarlo antes de crear un nuevo grafico
        if (myChart.chart) {
            myChart.chart.destroy();
        }
        myChart.style.backgroundColor = "white";
        myChart.chart = new Chart(myChart, config);
    } catch (e) {
        errorMessage(e.message);
    }
};

// Función para recibir errores y renderizarlos en DOM
let errorMessageContainer = "";
const errorMessage = (message) => {
    errorMessageContainer += `<li><i class="fa-solid fa-triangle-exclamation"></i>${message}</li>`;
    errorMessageText.innerHTML = errorMessageContainer;
};

// Ejecuta función "inputValueValidation()" la que evalua el monto ingresado por el usuario, en caso de ser un numero esta pasara a la función "getUserSelectedValues()" la cual obtiene los valores seleccionados por el usuario, para posteriormente hacer el llamado a funcion que calcula la conversión "calculateCurrencyConversion()" y crea grafico "renderGraph"
calculateValue.addEventListener("click", () => {
    inputValueValidation();
});

setCurrencysToEconomicIndicators();
