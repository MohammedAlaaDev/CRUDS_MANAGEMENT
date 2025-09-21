if (!(localStorage.getItem("products"))) {
    localStorage.setItem("products", JSON.stringify([{ id: 0, category: "Test", title: "Test Item", price: "50", taxes: "20", ads: "10", discount: "10", total: "70" }]))
}

// main products
let products = JSON.parse(localStorage.getItem("products"));

// inputs
const title = document.getElementById("title");
const price = document.getElementById("price");
const taxes = document.getElementById("taxes");
const ads = document.getElementById("ads");
const discount = document.getElementById("discount");
const total = document.getElementById("total");
const totalText = document.getElementById("totalText");
const count = document.getElementById("count");
const category = document.getElementById("category");
const searchSection = document.getElementById("searchSection");
const search = document.getElementById("search");

/* Start Buttons*/
const submit = document.getElementById("submit");
const deleteAll = document.getElementById("deleteAll");
const clear = document.getElementById("clear");
const dropdownBtn = document.getElementById("dropdownBtn");
/* End Buttons*/

/* handle theme */
const colorBtns = document.getElementsByClassName("color");
if (localStorage.getItem("currentColortheme")) {
    const activDiv = document.querySelector(`.${localStorage.getItem("currentColortheme")}`);
    activDiv.classList.add("active");
    document.body.className = localStorage.getItem("currentColortheme");
} else {
    const activDiv = document.querySelector(`.blue`);
    activDiv.classList.add("active");
    document.body.className = "blue";
}
/* ==== handle theme ==== */

// tbody
const tbody = document.getElementById("tbody");


/* Start Current Status */
let mode = "create";
let globalEditedID;
let searchMode = localStorage.getItem("searchMode") || "title";
handleSeachLocalStorage();
let globalDeletedID;
/* End Current Status */


/* Start highlighting the filled inputs*/
const allInputs = document.getElementsByTagName("input");
Array.from(allInputs).forEach((input) => {
    input.onchange = () => {
        if (input.value.trim()) {
            input.style.opacity = "1";
        } else {
            input.style.opacity = "0.5";
        }
    }
})
/* End highlighting the filled inputs*/


/* check if there is a need to show table&search or not */
function infoChecking() {
    if (localStorage.getItem("products")) {
        table.style.display = "table";
        searchSection.style.display = "flex";
    } else {
        table.style.display = "none";
        searchSection.style.display = "none";
    }
}

infoChecking();
/* ===== check if there is a need to show table&search or not ===== */


/* Start Total calculation */
function handleTotalPrice() {
    if (price.value && taxes.value
        && ads.value && discount.value) {
        let result = +price.value + +taxes.value + +ads.value -
            (+discount.value >= 0 ? +discount.value : -discount.value);
        result = result <= 0 ? "free" : result;
        totalText.innerHTML = result;
        total.style.backgroundColor = "#029842";
    } else {
        total.style.backgroundColor = "rgb(240, 32, 32)";
        totalText.innerHTML = "";
    }
}
/* End Total calculation */


/* Start Show Data */
function showData() {
    infoChecking();
    if (JSON.parse(localStorage.getItem("products"))) {
        let productsUI = JSON.parse(localStorage.getItem("products")).map((product) => {
            return `
        <tr>
            <td>${product.id + 1}</td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
            <td>$${product.taxes}</td>
            <td>$${product.ads}</td>
            <td>-$${product.discount}</td>
            <td>${product.total === "free" ? "free" : `$${product.total}`}</td>
            <td>${product.category}</td>
            <td><button id=${product.id} onclick="setEditMode(this.id)">Edit</button></td>
            <td><button class="btn deletebtn" type="button" data-bs-toggle="modal" data-bs-target="#exampleModal" id=${product.id} onclick="setDeletedID(this.id)">Delete</button></td>
        </tr>
            `
        })

        tbody.innerHTML = "";

        productsUI.forEach((ui) => {
            tbody.innerHTML += ui;
        })

        if (JSON.parse(localStorage.getItem("products")).length) {
            deleteAll.style.display = "block";
            deleteAll.innerHTML = `Delete All (${JSON.parse(localStorage.getItem("products")).length})`;
        }
    } else {
        tbody.innerHTML = "";
        deleteAll.style.display = "none";
    }
}

showData();
/* End Show Data */


/* Start handling submit button (create or edit) */
function handleSubmit() {
    handleTotalPrice();
    if (title.value.trim() && price.value && taxes.value
        && ads.value && discount.value && category.value.trim() && isNaN(+title.value.trim()) &&
        isNaN(+category.value.trim())) {
        if (mode === "create") {
            let newProduct = {
                id: products.length,
                title: title.value,
                price: price.value,
                taxes: taxes.value,
                ads: ads.value,
                discount: +discount.value >= 0 ? "" + +discount.value : "" + -discount.value,
                total: totalText.innerHTML,
                category: category.value,
            }

            if (+count.value + products.length > 100 || products.length >= 100) {
                count.value = "";
                count.placeholder = "Max 100 items - shrink count or table to add";
                count.style.opacity = "0.5";
            } else if (count.value === "") {
                products.push({ ...newProduct });
                localStorage.setItem("products", JSON.stringify(products));
                count.placeholder = "count (optional - max 100)";
                Array.from(allInputs).forEach((input) => {
                    input.value = "";
                    input.style.opacity = "0.5";
                })
                showData();
            } else {
                let lastIndex = products.length;
                for (let i = 0; i < +count.value; i++) {
                    products.push({ ...newProduct, id: lastIndex });
                    lastIndex++;
                }
                localStorage.setItem("products", JSON.stringify(products));
                count.placeholder = "count (optional - max 100)";
                Array.from(allInputs).forEach((input) => {
                    input.value = "";
                    input.style.opacity = "0.5";
                })
                showData();
            }


            total.style.backgroundColor = "rgb(240, 32, 32)";
            totalText.innerHTML = "";

            if (JSON.parse(localStorage.getItem("products"))) {
                deleteAll.style.display = "block";
                deleteAll.innerHTML = `Delete All (${JSON.parse(localStorage.getItem("products")).length})`;
            }

        } else {

            let editedProduct = {
                id: +globalEditedID,
                title: title.value,
                price: price.value,
                taxes: taxes.value,
                ads: ads.value,
                discount: + discount.value >= 0 ? "" + +discount.value : "" + -discount.value,
                total: totalText.innerHTML,
                category: category.value,
            }

            products[globalEditedID] = { ...editedProduct };

            localStorage.setItem("products", JSON.stringify(products));

            showData();

            count.style.display = "block";
            submit.innerHTML = "Create";
            mode = "create";
            clear.style.display = "block";
            searchSection.style.display = "flex";
            Array.from(allInputs).forEach((input) => {
                input.value = "";
                input.style.opacity = 0.5;
            })
            handleTotalPrice();
        }

        title.placeholder = "title *";
        price.placeholder = "price *";
        taxes.placeholder = "taxes *";
        ads.placeholder = "ads *";
        discount.placeholder = "discount *";
        category.placeholder = "category *";

        handleExtraSpace();

    } else {

        if (title.value.trim() === "") {
            title.value = "";
            title.style.opacity = "0.5";
            title.placeholder = "title is required";
        } else if (!(isNaN(+title.value.trim()))) {
            title.value = "";
            title.placeholder = "title must have at least one letter";
            title.style.opacity = "0.5";
        }

        price.value = price.value === "" ? "" : price.value;
        price.placeholder = price.value === "" ? "price is required" : "price *";

        taxes.value = taxes.value === "" ? "" : taxes.value;
        taxes.placeholder = taxes.value === "" ? "taxes are required" : "taxes *";

        ads.value = ads.value === "" ? "" : ads.value;
        ads.placeholder = ads.value === "" ? "ads are required" : "ads *";

        discount.value = discount.value === "" ? "" : discount.value;
        discount.placeholder = discount.value === "" ? "discount is required" : "discount *";

        if (category.value.trim() === "") {
            category.value = "";
            category.placeholder = "category is required";
            category.style.opacity = "0.5";
        } else if (!(isNaN(+category.value.trim()))) {
            category.value = "";
            category.placeholder = "category must have at least one letter";
            category.style.opacity = "0.5";
        }

        handleTotalPrice();
    }
}
/* End handling submit button (create or edit) */


/* Start Clearing inputs function */
function clearInputs() {
    Array.from(allInputs).forEach((input) => {
        input.value = "";
        input.style.opacity = "0.5";
    })
    handleTotalPrice();
}
/* End Clearing inputs function */

// Set deleted id
function setDeletedID(deletedIdx) {
    globalDeletedID = deletedIdx;
}
// == Set deleted id ==

/* Start deleting single element */
function handleSingleDelete() {
    products.splice(globalDeletedID, 1);

    let newProducts = products.map((product, idx) => {
        return { ...product, id: idx };
    })

    localStorage.setItem("products", JSON.stringify(newProducts));
    if (JSON.parse(localStorage.getItem("products")).length === 0) {
        localStorage.removeItem("products");
    }
    showData();
}
/* End deleting single element */


/* Start deleting All elements */
function handleDeleteAll() {
    localStorage.removeItem("products");
    products = [];
    showData();
}
/* End deleting All elements */


/* Start Editing Mode */
function setEditMode(editedID) {
    mode = "edit";
    globalEditedID = editedID;

    let editedProduct = JSON.parse(localStorage.getItem("products"))[globalEditedID];

    title.value = editedProduct.title;
    price.value = editedProduct.price;
    taxes.value = editedProduct.taxes;
    ads.value = editedProduct.ads;
    discount.value = editedProduct.discount;
    category.value = editedProduct.category;

    Array.from(allInputs).forEach((input) => {
        if (input.value.trim()) {
            input.style.opacity = "1";
        }
    })

    count.style.display = "none";
    clear.style.display = "none";
    searchSection.style.display = "none";
    deleteAll.style.display = "none";
    handleTotalPrice();

    scroll({
        top: 0,
        behavior: "smooth"
    })

    let check = setInterval(() => {
        if (window.scrollY === 0) {
            title.focus();
            table.style.display = "none";
            clearInterval(check);
        }
    }, 50);
    submit.innerHTML = "Edit";

}
/* End Editing Mode */


/* Start "Enter" key with inputs  */
title.addEventListener("keyup", (e) => {
    if (title.value.trim() && e.key === "Enter") {
        price.focus();
    }
})
price.addEventListener("keyup", (e) => {
    if (price.value.trim() && e.key === "Enter") {
        taxes.focus();
    }
})
taxes.addEventListener("keyup", (e) => {
    if (taxes.value.trim() && e.key === "Enter") {
        ads.focus();
    }
})
ads.addEventListener("keyup", (e) => {
    if (ads.value.trim() && e.key === "Enter") {
        discount.focus();
    }
})
discount.addEventListener("keyup", (e) => {
    if (discount.value.trim() && e.key === "Enter") {
        mode === "create" ? count.focus() : category.focus();
    }
})
count.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        category.focus();
    }
})
category.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        handleSubmit();
        category.blur();
    }
})
/* End "Enter" key with inputs  */


/* Start Setting Search Mode */
function setSearchMode(searchID) {
    if (searchID === "titleSearch") {
        searchMode = "title";
    } else if (searchID === "categorySearch") {
        searchMode = "category";
    } else if (searchID === "priceSearch") {
        searchMode = "price";
    } else if (searchID === "taxesSearch") {
        searchMode = "taxes";
    } else if (searchID === "adsSearch") {
        searchMode = "ads";
    } else if (searchID === "discountSearch") {
        searchMode = "discount";
    } else {
        searchMode = "total";
    }

    dropdownBtn.innerHTML = searchMode;


    search.placeholder = `search by ${searchMode}`;
    search.value = "";
    search.focus();
    localStorage.setItem("searchMode", searchMode);
    showData();
}

function handleSeachLocalStorage() {
    if (localStorage.getItem("searchMode")) {
        dropdownBtn.innerHTML = searchMode;
        search.placeholder = `search by ${searchMode}`;
        search.value = "";
    }
}
/* End Setting Search Mode */


/* Start handling search logic */
function handleSearch() {
    let matched;
    if (searchMode === "title" || searchMode === "category") {
        matched = products.filter((product) => {
            return product[searchMode].toLowerCase().includes(search.value.toLowerCase());
        })
    } else if (searchMode === "total" && isNaN(+search.value)) {
        matched = products.filter((product) => {
            return product[searchMode].toLowerCase().includes(search.value.toLowerCase());
        })
    } else {
        matched = products.filter((product) => {
            let cleanedValue = search.value.replace(/\s+/g, "");
            return String(product[searchMode]) === Math.abs(Number(cleanedValue)).toString();
        })
    }

    tbody.innerHTML = "";
    matched.forEach((matchedProduct) => {
        tbody.innerHTML += `
        <tr>
            <td>${matchedProduct.id + 1}</td>
            <td>${matchedProduct.title}</td>
            <td>$${matchedProduct.price}</td>
            <td>$${matchedProduct.taxes}</td>
            <td>$${matchedProduct.ads}</td>
            <td>-$${matchedProduct.discount}</td>
            <td>${matchedProduct.total === "free" ? "free" : `$${matchedProduct.total}`}</td>
            <td>${matchedProduct.category}</td>
            <td><button id=${matchedProduct.id} onclick="setEditMode(this.id)">Edit</button></td>
            <td><button class="btn deletebtn" type="button" data-bs-toggle="modal" data-bs-target="#exampleModal" id=${matchedProduct.id} onclick="setDeletedID(this.id)">Delete</button></td>
        </tr>
        `;
    })

    if (search.value.trim() === "") {
        showData();
    }
}
/* End handling search logic */

/* handle changing the main color */
Array.from(colorBtns).forEach((btn) => {
    btn.onclick = (e) => {
        Array.from(colorBtns).forEach((button) => {
            button.classList.remove("active");
        })
        btn.classList.add("active");
        document.body.className = e.target.dataset.color;
        localStorage.setItem("currentColortheme", e.target.dataset.color);
    }
})
/* === handle changing the main color === */

// extra spaces
function handleExtraSpace() {
    if (localStorage.getItem("products")) {
        let newProducts = JSON.parse(localStorage.getItem("products")).map((product) => {
            return { ...product, title: product.title.replace(/\s+/g, " ").trim(), category: product.category.replace(/\s+/g, " ").trim() };
        })
        localStorage.setItem("products", JSON.stringify(newProducts));
    }
}