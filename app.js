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

const convertDbToResponseObjAPI1 = (dbObj) => {
  return {
    movieName: dbObj.movie_name,
  };
};

//GET movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
       SELECT * FROM movie
        ORDER BY movie_id;
    `;
  const movieArray = await database.all(getMoviesQuery);
  //console.log(movieArray);
  response.send(
    movieArray.map((eachMovie) => convertDbToResponseObjAPI1(eachMovie))
  );
});

//POST Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  console.log(movieDetails);
  const { directorId, movieName, leadActor } = movieDetails;
  console.log(directorId);
  const addMovieQuery = `
        INSERT INTO movie
        (director_id,movie_name,lead_actor)
        VALUES
        (${directorId},'${movieName}','${leadActor}');
    `;
  const dbResponse = await database.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET movie based on movie_id
const convertAPI2 = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //console.log(movieId);
  const getMovieByIdQuery = `
        SELECT * FROM movie
        WHERE movie_id= ${movieId};
    `;
  const movie = await database.get(getMovieByIdQuery);
  //console.log(movie);
  response.send(convertAPI2(movie));
});

//updateDetails
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetailsQuery = `
        UPDATE movie
        SET 
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
        WHERE movie_id=${movieId};

    `;
  await database.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//DELETE movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM movie
        WHERE movie_id=${movieId};
    `;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET Directors

const convertAPI3 = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const directorDetailsQuery = `
        SELECT * FROM director
        ORDER BY director_id;
    `;
  const directorsArray = await database.all(directorDetailsQuery);
  response.send(directorsArray.map((each) => convertAPI3(each)));
});

//GET movieNames by Directors
app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNamesQuery = `
        SELECT movie_name FROM movie
        WHERE director_id=${directorId};
    `;
  const movieNamesArray = await database.all(getMovieNamesQuery);
  response.send(
    movieNamesArray.map((each) => convertDbToResponseObjAPI1(each))
  );
});

module.exports = app;
//end
