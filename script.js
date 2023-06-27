// Execute the updateTask function when the page is fully loaded
document.addEventListener('load', ()=>{
    updateTask();
});


// Get the toggle button, sidebar, flex box, and search bar elements from the DOM
 const toggleButton = document.getElementById("toggle-sidebar");
 const sidebar = document.getElementById("sidebar");
 const flexBox = document.getElementById('flex-box');
 const searchbar = document.getElementById('search-bar');

 
// Define the key for the favorite list in the localStorage
 const dbObjectFavList = "favoritesList";

 // If the favorite list doesn't exist in the localStorage, initialize it as an empty array
 if (localStorage.getItem(dbObjectFavList) == null) {
    localStorage.setItem(dbObjectFavList, JSON.stringify([]));
}


// Update the task counter with the number of items in the favorite list
function updateTask() {
    const favCounter = document.getElementById('total-counter');
    const db = JSON.parse(localStorage.getItem(dbObjectFavList));
    if (favCounter.innerText != null) {
        favCounter.innerText = db.length;
    }
}


// Check if an item exists in the favorite list
 function isFav(list, id) {
    let res = false;
    for (let i = 0; i < list.length; i++) {
        if (id == list[i]) {
            res = true;
        }
    }
    return res;
}


// Truncate a string to a given length
function truncate(str, n) {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
}


// Generate a random single-character string
 function generateOneCharString() {
    var possible = "abcdefghijklmnopqrstuvwxyz";
    return possible.charAt(Math.floor(Math.random() * possible.length));
}


// Attach an event listener to the toggle button click event
toggleButton.addEventListener("click", function () {
    showFavMealList();
    sidebar.classList.toggle("show");
    flexBox.classList.toggle('shrink');
});


// Handle the scroll event on the flex box
flexBox.onscroll = function () {

    if (flexBox.scrollTop > searchbar.offsetTop) {
        searchbar.classList.add("fixed");

    } else {
        searchbar.classList.remove("fixed");
    }
};


// Fetch meals from an API based on a URL and a search value
const fetchMealsFromApi = async (url, value) => {
    const response = await fetch(`${url + value}`);
    const meals = await response.json();
    return meals;
}


// Display a list of meals based on the search input value
async function showMealList() {
    const list = JSON.parse(localStorage.getItem(dbObjectFavList));
    const inputValue = document.getElementById("search-input").value;
    const url = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    const mealsData = await fetchMealsFromApi(url, inputValue);
    let html = '';

    if (mealsData.meals) {
        html = mealsData.meals.map(element => {

            return `
            <div class="card">
            <div class="card-top"  onclick="showMealDetails(${element.idMeal}, '${inputValue}')">
                <div class="dish-photo" >
                    <img src="${element.strMealThumb}" alt="">
                </div>
                <div class="dish-name">
                    ${element.strMeal}
                </div>
                <div class="dish-details">
                    ${truncate(element.strInstructions, 50)}
                    
                    <span class="button" onclick="showMealDetails(${element.idMeal}, '${inputValue}')">Read More</span>
                 
                </div>
            </div>
            <div class="card-bottom">
                <div class="like">

                <i class="fa-solid fa-heart ${isFav(list, element.idMeal) ? 'active' : ''} " onclick="addRemoveToFavList(${element.idMeal})"></i>
                
                </div>
                <div class="play">
                    <a href="${element.strYoutube}">
                        <i class="fa-brands fa-youtube"></i>
                    </a>
                </div>
            </div>
        </div>
            `
        }).join('');
        document.getElementById('cards-holder').innerHTML = html;
    }
}


// Add or remove a meal from the favorite list
function addRemoveToFavList(id) {
    const detailsPageLikeBtn = document.getElementById('like-button');
    let db = JSON.parse(localStorage.getItem(dbObjectFavList));
    let ifExist = false;
    for (let i = 0; i < db.length; i++) {
        if (id == db[i]) {
            ifExist = true;
        }

    } if (ifExist) {
        db.splice(db.indexOf(id), 1);
    } else {
        db.push(id);
    }

    localStorage.setItem(dbObjectFavList, JSON.stringify(db));
    if (detailsPageLikeBtn != null) {
        detailsPageLikeBtn.innerHTML = isFav(db, id) ? 'Remove From Favorite' : 'Add To Favorite';
    }

    showMealList();
    showFavMealList();
    updateTask();
}


/**
 * Display the details of a meal
 * @async
 * @function
 * @param {string} itemId - The ID of the meal to show details for
 * @param {string} searchInput - The search input used to fetch the related meals
 */
async function showMealDetails(itemId, searchInput) {
    console.log("searchInput:...............", searchInput);
    const list = JSON.parse(localStorage.getItem(dbObjectFavList));
    flexBox.scrollTo({ top: 0, behavior: "smooth" });
    const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    const searchUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    const mealList = await fetchMealsFromApi(searchUrl,searchInput);
    console.log('Meals list:..........', mealList);
    let html = ''
    const mealDetails = await fetchMealsFromApi(url, itemId);
    if (mealDetails.meals) {
        html = `
        <div class="container remove-top-margin">

            <div class="header hide">
                <div class="title">
                    Let's Eat Something New
                </div>
            </div>
            <div class="fixed" id="search-bar">
                <div class="icon">
                    <i class="fa-solid fa-search "></i>
                </div>
                <div class="new-search-input">
                    <form onkeyup="showMealList()">
                        <input id="search-input" type="text" placeholder="Search Your Fav Meal..." />
                    </form>
                </div>
            </div>
        </div>
        <div class="item-details">
        <div class="item-details-left">
        <img src="  ${mealDetails.meals[0].strMealThumb}" alt="">
    </div>
    <div class="item-details-right">
        <div class="item-name">
            <strong>Name: </strong>
            <span class="item-text">
            ${mealDetails.meals[0].strMeal}
            </span>
         </div>
        <div class="item-category">
            <strong>Category: </strong>
            <span class="item-text">
            ${mealDetails.meals[0].strCategory}
            </span>
        </div>
        <div class="item-ingredient">
            <strong>Ingredient: </strong>
            <span class="item-text">
            ${mealDetails.meals[0].strIngredient1},${mealDetails.meals[0].strIngredient2},
            ${mealDetails.meals[0].strIngredient3},${mealDetails.meals[0].strIngredient4}
            </span>
        </div>
        <div class="item-instruction">
            <strong>Instructions: </strong>
            <ul class="item-text">
            ${mealDetails.meals[0].strInstructions}
            </ul>
        </div>
        <div class="item-video">
            <strong>Video Link:</strong>
            <div id="watch-btn" class="item-text">
            <a href="${mealDetails.meals[0].strYoutube}">Watch Here</a>
            </div>
            <div id="like-button" onclick="addRemoveToFavList(${mealDetails.meals[0].idMeal})"> 
             ${isFav(list, mealDetails.meals[0].idMeal) ? 'Remove From Favorite' : 'Add To Favorite'} </div>
        </div>
    </div>
</div> 
        <div class="card-name">
        Related Items
    </div>
    <div id="cards-holder" class=" remove-top-margin ">`
    }
    if( mealList.meals!=null){
        html += mealList.meals.map(element => {
            return `       
            <div class="card">
                <div class="card-top"  onclick="showMealDetails(${element.idMeal}, '${searchInput}')">
                    <div class="dish-photo" >
                        <img src="${element.strMealThumb}" alt="">
                    </div>
                    <div class="dish-name">
                        ${element.strMeal}
                    </div>
                    <div class="dish-details">
                        ${truncate(element.strInstructions, 50)}
                        <span class="button" onclick="showMealDetails(${element.idMeal}, '${searchInput}')">Know More</span>
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="like">
                       
                        <i class="fa-solid fa-heart ${isFav(list, element.idMeal) ? 'active' : ''} " 
                        onclick="addRemoveToFavList(${element.idMeal})"></i>
                    </div>
                    <div class="play">
                        <a href="${element.strYoutube}">
                            <i class="fa-brands fa-youtube"></i>
                        </a>
                    </div>
                </div>
            </div>
        `
        }).join('');
    }
  
    html = html + '</div>';

    document.getElementById('flex-box').innerHTML = html;
}


/**
This function is used to show all the meals which are added to the favorite list.
@function
@async
@returns {string} html - This returns html which is used to show the favorite meals.
@throws {Error} If there is no favorite meal then it will show "Nothing To Show....."
@example
showFavMealList()
*/
async function showFavMealList() {
    let favList = JSON.parse(localStorage.getItem(dbObjectFavList));
    let url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    let html = "";

    if (favList.length == 0) {
        html = `<div class="fav-item nothing"> <h1> 
        Add Your Fav Meal Here</h1> </div>`
    } else {
        for (let i = 0; i < favList.length; i++) {
            const favMealList = await fetchMealsFromApi(url, favList[i]);
            if (favMealList.meals[0]) {
                let element = favMealList.meals[0];
                html += `
                <div class="fav-item" onclick="showMealDetails(${element.idMeal},'${generateOneCharString()}')">

              
                <div class="fav-item-photo">
                    <img src="${element.strMealThumb}" alt="">
                </div>
                <div class="fav-item-details">
                    <div class="fav-item-name">
                        <strong></strong>
                        <span class="fav-item-text">
                           ${element.strMeal}
                        </span>
                    </div>
                    <div id="fav-like-button" onclick="addRemoveToFavList(${element.idMeal})">
                    <i class="fa-regular fa-trash-can" style="color: #ed1e07;"></i>
                    </div>

                </div>

            </div>               
                `
            }
        }
    }
    document.getElementById('fav').innerHTML = html;
}

updateTask();


/* Hide NavBar on Scrolling Down */
// var prevScrollPos = window.pageYOffset;
// window.onscroll = function() {
// var currentScrollPos = window.pageYOffset;
//   if (prevScrollPos > currentScrollPos) {
//     document.getElementById("navbar").style.top = "0";
//   } else {
//     document.getElementById("navbar").style.top = "-100px";
//   }
//   prevScrollPos = currentScrollPos;
// }

// Hiding Footer on scroll down............................
var prevScrollPos = window.pageYOffset;
window.onscroll = function() {
var currentScrollPos = window.pageYOffset;
  if (prevScrollPos > currentScrollPos) {
    document.getElementById("footer").style.bottom = "0";
  } else {
    document.getElementById("footer").style.bottom = "-50px";
  }
  prevScrollPos = currentScrollPos;
}