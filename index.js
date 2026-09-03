import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Hilfsfunktion: HTML-Sonderzeichen escapen, um XSS zu vermeiden
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Hilfsfunktion: aktuelles Datum als lesbarer String
function formatDate(date) {
  return `${date.toLocaleString("de", { month: "long" })} ${date.getDate()}, ${date.getFullYear()}`;
}

// Testblogs erstellen (vor der Nutzung deklariert!)
const blogs = [
  {
    title: "Was ist CSS Grid?",
    author: "Max Mustermann",
    content:
      "Kennst du das? Du bastelst an einem Webseiten-Layout rum, schiebst Divs hin und her, verzweifelst an Floats oder Flexbox stößt einfach an seine Grenzen - und denkst dir: Es muss doch einen einfacheren Weg geben. Spoiler: Den gibt's. Er heißt CSS Grid. Was ist CSS Grid eigentlich? CSS Grid ist ein Layout-System, mit dem du Webseiten in Zeilen und Spalten gleichzeitig gestalten kannst – im Gegensatz zu Flexbox, das eher eindimensional (entweder Reihe oder Spalte) tickt. Stell dir ein Schachbrett vor: Mit Grid bestimmst du ganz genau, welches Element in welchem Feld landet.",
    date: "03.09.2026",
  },
  {
    title: "Was ist Flexbox überhaupt?",
    author: "Jean Claude van AI",
    content:
      "Flexbox – kurz für Flexible Box Layout – ist ein CSS-Modul, das speziell dafür entwickelt wurde, Elemente innerhalb eines Containers anzuordnen, auszurichten und ihren verfügbaren Platz zu verteilen. Anders als bei traditionellen Layout-Methoden musst du dich nicht mehr mit float, clear oder komplizierten Positionierungstricks herumschlagen. Das Prinzip ist einfach: Du hast einen Container (den Flex-Container) und darin liegende Elemente (die Flex-Items). Sobald du dem Container display: flex gibst, verwandeln sich seine direkten Kindelemente automatisch in Flex-Items, die sich nach den Regeln von Flexbox verhalten.",
    date: "03.09.2026",
  },
];

// Index des Blogs, der gerade bearbeitet wird
let blogEditIndex = null;

// Startseite
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Seite mit allen Blogs anzeigen
app.get("/allBlogs", (req, res) => {
  res.render("blogsPage.ejs", { blogs });
});

// Formular zum Erstellen eines neuen Blogs anzeigen
app.get("/writeBlog", (req, res) => {
  res.render("blogs.ejs");
});

// Einen bestimmten Blog anzeigen
app.get("/view-blog", (req, res) => {
  const blogIndex = parseInt(req.query.blogIndex, 10);

  if (isNaN(blogIndex) || blogIndex < 0 || blogIndex >= blogs.length) {
    return res.status(404).send("Blog nicht gefunden");
  }

  const blog = blogs[blogIndex];
  const formattedContent = escapeHTML(blog.content).replace(/\n/g, "<br>");

  res.render("viewBlog.ejs", {
    title: blog.title,
    author: blog.author,
    date: blog.date,
    content: formattedContent,
  });
});

// Einen neuen Blog erstellen
app.post("/blog", (req, res) => {
  const newBlog = {
    title: req.body.title,
    author: req.body.author,
    content: req.body.content,
    date: formatDate(new Date()),
  };
  blogs.push(newBlog);
  res.render("blogsPage.ejs", { blogs });
});

// Formular zum Bearbeiten eines bestimmten Blogs anzeigen
app.post("/editPage", (req, res) => {
  blogEditIndex = parseInt(req.body.blogIndex, 10);
  const blogEdit = blogs[blogEditIndex];
  res.render("blogs.ejs", { blogEdit });
});

// Den zuvor ausgewählten Blog bearbeiten/speichern
app.post("/editBlog", (req, res) => {
  const blogToEdit = blogs[blogEditIndex];
  if (!blogToEdit) {
    return res.status(400).send("Kein Blog zum Bearbeiten ausgewählt");
  }
  blogToEdit.title = req.body.title;
  blogToEdit.author = req.body.author;
  blogToEdit.content = req.body.content;
  res.render("blogsPage.ejs", { blogs });
});

// Blog löschen
app.post("/delete-blog", (req, res) => {
  const blogIndex = parseInt(req.body.blogIndex, 10);
  if (!isNaN(blogIndex) && blogIndex >= 0 && blogIndex < blogs.length) {
    blogs.splice(blogIndex, 1);
  }
  res.render("blogsPage.ejs", { blogs });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
