# Cuemby backend test

## Build setup

```bash
# Build docker express container
$ docker-compose build

# Run all docker instances
$ docker-compose up

# Run shell of express container for fetching data from easports
$ docker-compose exec api bash
```

### Inside api container bash
```bash
# Run fetching script
$ node fetchPlayers.js
# wait till finish
# Get out of the bash and test the api endpoints
```

### URLs

* Mongo viewer http://localhost:8081/
* EndPoints:
    - http://localhost:3000/api/v1/team
    - http://localhost:3000/api/v1/players?search=cristi&order=asc&page=1

### For header
"x-api-key": "test_jUfJ1vBdBzceF3pOqTW39Bh808ATJ89kfJnxeLe4"

#

## By: Nicholas David Carreño Pardo