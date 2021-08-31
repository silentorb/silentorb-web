---
title: Marloth
subtitle: A Child's Fairytale World
template: marloth
headers:
  - <script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.73/dist/epub.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  - <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js" integrity="sha512-xQBQYt9UcgblF6aCMrwU1NkVA7HCXaSN2oq0so80KO+y68M+n64FOcqgav4igHe6D5ObBLIf68DWv+gfBowczg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
---

<div>
<script>
document.addEventListener("DOMContentLoaded", function() {
  const container = "book-container"
  try {
    const book = ePub("https://static.silentorb.com/books/marloth-fairytale-2.0.0.epub")
    const rendition = book.renderTo(container, {width: '100%', height: '100%'})
    const displayed = rendition.display()
  } catch {
    document.getElementById(container).appendChild(document.createTextNode("There was a problem loading the e-book"))  
  }
})
</script>
<div id="book-container"></div>
</div>
