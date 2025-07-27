document.addEventListener("DOMContentLoaded", () => {
  const quoteList = document.getElementById("quote-list");
  const quoteForm = document.getElementById("new-quote-form");
  const sortButton = document.getElementById("sort-button");

  let quotes = [];
  let isSorted = false;

  fetchQuotes();

  quoteForm.addEventListener("submit", handleFormSubmit);
  sortButton.addEventListener("click", toggleSort);

  function fetchQuotes() {
    fetch("http://localhost:3000/quotes?_embed=likes")
      .then(res => res.json())
      .then(data => {
        quotes = data;
        renderQuotes();
      });
  }

  function renderQuotes() {
    quoteList.innerHTML = "";

    const sortedQuotes = isSorted
      ? [...quotes].sort((a, b) => a.author.localeCompare(b.author))
      : quotes;

    sortedQuotes.forEach(renderQuote);
  }

  function renderQuote(quote) {
    const li = document.createElement("li");
    li.className = "quote-card";
    li.innerHTML = `
      <blockquote class="blockquote">
        <p class="mb-0">${quote.quote}</p>
        <footer class="blockquote-footer">${quote.author}</footer>
        <br>
        <button class='btn-success'>Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
        <button class='btn-danger'>Delete</button>
      </blockquote>
    `;

    const likeBtn = li.querySelector(".btn-success");
    const deleteBtn = li.querySelector(".btn-danger");

    likeBtn.addEventListener("click", () => likeQuote(quote, likeBtn));
    deleteBtn.addEventListener("click", () => deleteQuote(quote.id, li));

    quoteList.appendChild(li);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const newQuote = {
      quote: quoteForm.quote.value,
      author: quoteForm.author.value
    };

    fetch("http://localhost:3000/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newQuote)
    })
      .then(res => res.json())
      .then(quote => {
        quote.likes = [];
        quotes.push(quote);
        renderQuotes();
        quoteForm.reset();
      });
  }

  function deleteQuote(id, li) {
    fetch(`http://localhost:3000/quotes/${id}`, {
      method: "DELETE"
    }).then(() => {
      quotes = quotes.filter(q => q.id !== id);
      li.remove();
    });
  }

  function likeQuote(quote, btn) {
    fetch("http://localhost:3000/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quoteId: quote.id,
        createdAt: Math.floor(Date.now() / 1000)
      })
    })
      .then(res => res.json())
      .then(newLike => {
        quote.likes.push(newLike);
        const span = btn.querySelector("span");
        span.textContent = quote.likes.length;
      });
  }

  function toggleSort() {
    isSorted = !isSorted;
    sortButton.textContent = `Sort by Author: ${isSorted ? "ON" : "OFF"}`;
    renderQuotes();
  }
});
