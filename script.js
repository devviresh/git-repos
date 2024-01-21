const loader = document.getElementById('loader');
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const searchBox = document.getElementById("repoSearch");
const reposList = document.getElementById("repos-list");
const usernameInput = document.getElementById("username");
const perPageSelect = document.getElementById("perPage");
let currentPage = 1;

function onSearch() {
    getUserDetails();
    getRepos();
}

async function getUserDetails() {
    const username = document.getElementById('username').value;
    loader.style.display = 'block';

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        const userData = await response.json();
        loader.style.display = 'none';


        const userDetails = document.getElementById('user-details');

        if (userData.message == 'Not Found') {
            userDetails.innerHTML = "<p>User not found.</p>";
            return
        }

        userDetails.innerHTML = `
            <img src="${userData.avatar_url}" alt="${username}'s Profile Image" width="150">

            <div id="user-info" class="user-info">
                <h2>${userData.name || username}</h2>
                <p>Bio: ${userData.bio || 'N/A'}</p>
                <p>Location: ${userData.location || 'N/A'}</p>
                <a href="${userData.html_url}" target="_blank">
                    <img src="assets/git.svg" alt="GitHub Icon" width="20" height="20">
                    ${userData.html_url}
                </a>
            </div>
        `;
    } catch (error) {
        loader.style.display = 'none';
        console.error(error);
        alert('Error fetching user details.');
    }
}

function getRepos() {
    const userName = usernameInput.value.trim();
    if (userName === "") {
        alert("Please enter a GitHub username");
        return;
    }

    const perPage = perPageSelect.value;
    const endpoint = getPublicReposEndpoint(userName, currentPage, perPage);

    loader.style.display = 'block';

    fetch(endpoint)
        .then((response) => response.json())
        .then((repos) => {
            loader.style.display = 'none';
            displayRepos(repos);
        })
        .catch((error) => {
            loader.style.display = 'none';
            console.error("Error fetching repositories:", error);
            alert("Error fetching repositories. Please try again.");
        });
}

function displayRepos(repos) {
    reposList.innerHTML = ""; // Clear previous results

    if (repos.length === 0) {
        searchBox.style.display = 'none';
        reposList.innerHTML = "<p>No repositories found.</p>";
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = true;
        return;
    }

    searchBox.style.display = 'block';
    repos.forEach((repo) => {
        const repoItem = document.createElement("li");
        repoItem.className = "repo-item";

        const repoName = document.createElement("h2");
        repoName.textContent = repo.name;
        repoItem.appendChild(repoName);

        const repoDescription = document.createElement("p");
        repoDescription.textContent = repo.description || 'No description available.';
        repoItem.appendChild(repoDescription);

        if (repo.language) {
            const repoLanguage = document.createElement("span");
            repoLanguage.className = 'lan'
            repoLanguage.textContent = repo.language;
            repoItem.appendChild(repoLanguage);
        }

        reposList.appendChild(repoItem);
    });

    updatePageNumber();
    disableButtons();
}

function updatePageNumber() {
    document.getElementById(
        "page-number"
    ).textContent = `Page: ${currentPage}`;
}

function disableButtons() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = reposList.childElementCount === 0;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        getRepos();
    }
}

function nextPage() {
    currentPage++;
    getRepos();
}

function getPublicReposEndpoint(userName, page, perPage) {
    return `https://api.github.com/users/${userName}/repos?page=${page}&per_page=${perPage}`;
}


//  Filter Repositories by name
function filterRepositories() {
    console.log("filtering...")
    const searchTerm = document.getElementById('repoSearch').value.toLowerCase();
    const repositoryDivs = document.querySelectorAll('.repo-item');

    repositoryDivs.forEach(repositoryDiv => {
        const repositoryName = repositoryDiv.querySelector('h2').textContent.toLowerCase();
        if (repositoryName.includes(searchTerm)) {
            repositoryDiv.style.display = 'block';
        } else {
            repositoryDiv.style.display = 'none';
        }
    });
}