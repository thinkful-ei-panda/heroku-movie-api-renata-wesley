require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const {PORT,NODE_ENV} = require ('./config');
const movieData= require('./movieData.js');

const app=express();
const morganSetting = NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());

function validateBearerToken(req,res,next){
  const authToken= req.get('Authorization');
  const apiToken = process.env.API_TOKEN;

  if(!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unathorized request'});
  }
  next();
}

app.use(validateBearerToken);

app.use((error,req,res,next) => {
  let response;
  if(NODE_ENV==='production'){
    response={error: {message: 'server error'}};
  } else{
    response={error};
  }
  res.status(500).json(response);
});

app.get('/movie', (req,res)=>{
  const {genre, country, avg_vote} = req.query;
  const avgVote=avg_vote;

  let filteredByGenre;
  let filteredByCountry;
  let filteredByAvgVote;

  if (genre){
    const genreLowerCase= genre.toLowerCase();
    filteredByGenre=movieData.filter(movie => {
      return movie.genre.toLowerCase().includes(genreLowerCase);
    });
  }else{
    filteredByGenre=movieData;
  }

  if (country){
    const countryLowerCase=country.toLowerCase();
    filteredByCountry=filteredByGenre.filter(movie => {
      return movie.country.toLowerCase().includes(countryLowerCase);
    });
  }else{
    filteredByCountry=filteredByGenre;
  }

  if(avgVote){
    const avgVoteNumber=Number(avgVote);
    filteredByAvgVote=filteredByCountry.filter(movie => {
      return Number(movie.avg_vote)>=avgVoteNumber;
    });
  }else{
    filteredByAvgVote=filteredByCountry;
  }

  res.json(filteredByAvgVote);
});

app.listen(PORT);