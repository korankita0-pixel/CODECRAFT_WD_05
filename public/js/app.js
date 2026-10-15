
const postInput = document.getElementById("postInput");
const publishButton = document.getElementById("publishButton");
const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const feedSort = document.getElementById("feedSort");
const toast = document.getElementById("toast");

let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function updateEmptyState() {
    const posts = [...postsContainer.querySelectorAll(".post-card")];
    const visiblePosts = posts.filter(post => !post.classList.contains("hidden"));
    document.getElementById("emptyState").classList.toggle("hidden", visiblePosts.length > 0);
}

function applySearch() {
    const query = searchInput.value.trim().toLowerCase();

    postsContainer.querySelectorAll(".post-card").forEach(post => {
        const matches = post.textContent.toLowerCase().includes(query);
        post.classList.toggle("hidden", !matches);
    });

    updateEmptyState();
}

searchInput.addEventListener("input", applySearch);

publishButton.addEventListener("click", () => {
    const content = postInput.value.trim();

    if (!content) {
        showToast("Write something before creating a post.");
        postInput.focus();
        return;
    }

    const post = document.createElement("article");
    post.className = "post-card card";
    post.dataset.createdAt = String(Date.now());
    post.dataset.likes = "0";

    post.innerHTML = `
        <div class="post-header">
            <div class="avatar">A</div>
            <div class="post-author">
                <h3>You</h3>
                <p>@yourusername · just now</p>
            </div>
            <button class="more-button delete-post" aria-label="Delete your post">•••</button>
        </div>
        <p class="post-text">${escapeHTML(content).replace(/\n/g, "<br>")}</p>
        <div class="post-stats">
            <span>♡ <b class="like-count">0</b> likes</span>
            <span class="comment-count">0 comments</span>
        </div>
        <div class="post-actions">
            <button class="post-action like-button">♡ <span>Like</span></button>
            <button class="post-action comment-button">▢ <span>Comment</span></button>
            <button class="post-action share-button">↗ <span>Share</span></button>
        </div>
        <div class="comment-area hidden">
            <input class="comment-input" placeholder="Write a comment..." maxlength="300">
            <button class="small-button send-comment">Send</button>
            <div class="comments-list"></div>
        </div>
    `;

    postsContainer.prepend(post);
    postInput.value = "";
    searchInput.value = "";
    applySearch();
    sortPosts();
    showToast("Your post was added to the demo feed!");
});

postsContainer.addEventListener("click", async event => {
    const button = event.target.closest("button");
    if (!button) return;

    const post = button.closest(".post-card");

    if (button.classList.contains("like-button")) {
        const count = post.querySelector(".like-count");
        const liked = button.classList.toggle("liked");
        const current = Number(count.textContent) || 0;

        count.textContent = String(Math.max(0, current + (liked ? 1 : -1)));
        button.innerHTML = liked ? "♥ <span>Liked</span>" : "♡ <span>Like</span>";
        return;
    }

    if (button.classList.contains("comment-button")) {
        const area = post.querySelector(".comment-area");
        area.classList.toggle("hidden");

        if (!area.classList.contains("hidden")) {
            area.querySelector(".comment-input").focus();
        }
        return;
    }

    if (button.classList.contains("send-comment")) {
        const input = post.querySelector(".comment-input");
        const value = input.value.trim();

        if (!value) {
            showToast("Please write a comment first.");
            return;
        }

        const comment = document.createElement("div");
        comment.className = "comment-item";

        const author = document.createElement("strong");
        author.textContent = "You";

        const text = document.createElement("p");
        text.textContent = value;

        comment.append(author, text);
        post.querySelector(".comments-list").appendChild(comment);
        input.value = "";

        const count = post.querySelector(".comment-count");
        if (count) {
            const comments = post.querySelectorAll(".comment-item").length;
            count.textContent = `${comments} comment${comments === 1 ? "" : "s"}`;
        }

        showToast("Comment added to this demo post.");
        return;
    }

    if (button.classList.contains("share-button")) {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showToast("Page link copied!");
        } catch {
            showToast("Copy the website URL from your browser address bar.");
        }
        return;
    }

    if (button.classList.contains("delete-post")) {
        if (!post.dataset.createdAt) {
            showToast("This sample post cannot be deleted.");
            return;
        }

        if (confirm("Delete your demo post?")) {
            post.remove();
            updateEmptyState();
            showToast("Demo post deleted.");
        }
    }
});

document.querySelectorAll(".follow-button").forEach(button => {
    button.addEventListener("click", () => {
        const following = button.classList.toggle("following");
        button.textContent = following ? "Following" : "Follow";
        showToast(following ? "Following in this demo." : "Unfollowed in this demo.");
    });
});

document.querySelectorAll(".demo-story").forEach(story => {
    story.addEventListener("click", () => {
        showToast(`${story.dataset.story}'s sample story`);
    });
});

document.getElementById("addStory").addEventListener("click", () => {
    showToast("Story creation will be added in a later step.");
});

document.querySelectorAll(".trend-item").forEach(button => {
    button.addEventListener("click", () => {
        const tag = button.dataset.tag;
        searchInput.value = tag;
        applySearch();
        document.getElementById("feed").scrollIntoView({ behavior: "smooth" });
    });
});

document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    document.getElementById("themeToggle").textContent = isDark ? "☾" : "☼";
    showToast(isDark ? "Dark mode enabled." : "Light mode enabled.");
});

feedSort.addEventListener("change", sortPosts);

function sortPosts() {
    const posts = [...postsContainer.querySelectorAll(".post-card")];

    posts.sort((a, b) => {
        if (feedSort.value === "popular") {
            const likesA = Number(a.querySelector(".like-count")?.textContent || 0);
            const likesB = Number(b.querySelector(".like-count")?.textContent || 0);
            return likesB - likesA;
        }

        return Number(b.dataset.createdAt || 0) - Number(a.dataset.createdAt || 0);
    });

    posts.forEach(post => postsContainer.insertBefore(post, document.getElementById("emptyState")));
}

const currentDate = document.getElementById("currentDate");
currentDate.textContent = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
}).format(new Date());

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
        link.classList.add("active");
    });
});

console.log("ConnectSphere frontend initialized successfully.");
