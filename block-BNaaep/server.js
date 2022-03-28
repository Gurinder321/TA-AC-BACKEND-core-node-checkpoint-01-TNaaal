const http = require('http');
const fs = require('fs');
const url = require('url');
const usersPath = __dirname + '/users/';
const PORT = 5000;
const server = http.createServer(handleRequest);

function handleRequest(req, res) {
  console.log(req.url, req.method);
  let store = '';
  req.on('data', (chunk) => {
    store += chunk;
  });

  req.on('end', () => {
    const parsedUrl = url.parse(req.url, true);
    //  Access the homepage
    if (req.url === '/' && req.method === 'GET') {
      res.setHeader('content-type', 'text/html');
      fs.createReadStream('./index.html').pipe(res);
    }
    if (req.url === '/style.css' && req.method === 'GET') {
      res.setHeader('content-type', 'text/css');
      fs.createReadStream('./assets/style.css').pipe(res);
    }
    if (req.url === '/assets/index.png' && req.method === 'GET') {
      res.setHeader('content-type', 'image/png');
      fs.createReadStream('./assets/index.png').pipe(res);
    }

    //   Acess the about page
    if (req.url === '/about' && req.method === 'GET') {
      res.setHeader('content-type', 'text/html');
      fs.createReadStream('./about.html').pipe(res);
    }
    // Be able to create user
    if (req.url === '/users' && req.method === 'POST') {
      const username = JSON.parse(store).username;
      fs.open(usersPath + username + '.json', 'wx', (err, fd) => {
        if (err) return console.log(err);
        fs.writeFile(fd, store, (err) => {
          if (err) return console.log(err);
          fs.close(fd, () => {
            return res.end(`${username} created successfully`);
          });
        });
      });
    }
    //   Be able to search for user
    if (parsedUrl.pathname === '/users' && req.method === 'GET') {
      let username = parsedUrl.query.username;
      fs.readFile(usersPath + username + '.json', (err, content) => {
        if (err) return console.log(err);
        res.setHeader('content-type', 'application/json');
        return res.end(content);
      });
    }
    // Be able to edit user
    if (parsedUrl.pathname === '/users' && req.method === 'PUT') {
      let username = parsedUrl.query.username;
      fs.open(usersPath + username + '.json', 'r+', (err, fd) => {
        if (err) return console.log(err);
        fs.ftruncate(fd, (err) => {
          if (err) return console.log(err);
          fs.writeFile(fd, store, (err) => {
            if (err) return console.log(err);
            fs.close(fd, () => {
              return res.end(`${username} was updated successfully`);
            });
          });
        });
      });
    }
    // Be able to delete user
    if (parsedUrl.pathname === '/users' && req.method === 'DELETE') {
      let username = parsedUrl.query.username;
      fs.unlink(usersPath + username + '.json', (err) => {
        if (err) return console.log(err);
        return res.end(`${username} has been deleted`);
      });
    }

    // res.statusCode = 404;
    // res.end('Page not found!');
  });
}

server.listen(PORT, () => {
  console.log(`Servering is listening on PORT ${PORT}`);
});
