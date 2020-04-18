const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const CookieParser = require('./middleware/cookieParser');
const Auth = require('./middleware/auth');
const models = require('./models');
const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
// app.use(CookieParser.parseCookies);
// app.use(Auth.createSession);

app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
//is the inputted username valid?
//is the inputted password the correct password associated with user?
//if both of these tests pass, login is successful
//otherwise, err is sent back

app.get('/login',
  (req, res) => {
    res.render('login.ejs');
  });

app.get('/signup',
  (req, res) => {
    res.render('signup.ejs');
  });

app.post('/login', (req, res, next) => {
  var password = req.body.password;
  return models.Users.get({ username: req.body.username })
    .then(user => {
      if (models.Users.compare(password, user.password, user.salt)) {
        res.status(200).redirect('/');
      } else {
        throw error;
      }
    })
    .catch(error => {
      console.log(error);
      res.status(200).redirect('/login');
    });
  // if (!)
  //get (An object where the keys are column names and the values are the current values to be matched.)
  //models.Users.compare(attempted, password, salt)
  //attempted: from req object
  //password & salt: do a database query  -> db.query(queryStr, queryArgs, callback)
});

//is chosen username available?
//was a valid password inputted?
//if so, sign up is successful
//otherwise, err sent back


app.post('/signup', (req, res, next) => {

  return models.Users.create({ username: req.body.username, password: req.body.password })
    .then(res.status(200).redirect('/'))
    .catch(res.status(200).redirect('/signup'));
  //models.Users.create
});


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
