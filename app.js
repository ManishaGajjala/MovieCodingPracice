const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base Error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//GET movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
       SELECT * FROM movie
        ORDER BY movie_id;
    `;
  const movieArray = await database.all(getMoviesQuery);
  //console.log(movieArray);
  response.send(movieArray);
});

//POST Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  console.log(directorId);
  const addMovieQuery = `
        INSERT INTO movie
        {director_id,movie_name,lead_actor}
        VALUES
        (
            ${directorId},'${movieName},'${leadActor}
        );
    `;
  const dbResponse = await database.run(addMovieQuery);
  response.send("Movie Successfully Added");
});
