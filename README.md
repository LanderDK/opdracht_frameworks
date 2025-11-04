# Groepsopdracht frameworks voor serverapplicaties

Groep: 29
Studenten: Lander De Kesel & Jason De Ridder

## Beschrijving

Dit project is een webplatform voor het publiceren van blogs en vlogs. Makers kunnen artikelen en video’s delen, en bezoekers kunnen reacties plaatsen die direct in beeld verschijnen. Het doel is om content gemakkelijk te beheren en interactie tussen makers en publiek te stimuleren.

## Environmentvariabelen

Er is een .env bestand nodig met enkele ingevulde data, afhankelijk van de installatie bij de gebruiker. Dit ziet er als volgt uit:

```
NODE_ENV={stage} #Example development
PORT={webservice_port number}

# Database
DATABASE_HOST=database # Configuratie variabele uit de docker-compose.yaml file
DATABASE_MYSQL_HOST={ip-adres or localhost} # Configuratie voor de host op de MYSQL container
DATABASE_PORT={port_number}
DATABASE_USERNAME={username}
DATABASE_PASSWORD={password}
DATABASE_NAME={database_name}

# CORS
CORS_ORIGINS={link_for_cors} #Example: http://localhost:3000,http://localhost:3000
CORS_MAX_AGE={number} #example: 600
```

## Zelf starten van de service

Het lokaal uitvoeren van dit project vereist de installatie van Docker (docker desktop op Windows 11!).

Indien de bovenstaande .env correct geconfigureerd is, moet `docker compose up -d` uitgevoerd worden in de command line om de service te starten. Dit zou alle containers in de correcte volgorde moeten starten en de web service beschikbaar maken op de `http://localhost:3000`.

## Testen van de webservice online

De webservice is ook online beschikbaar. Deze is terug te vinden op `http://157.193.171.84:3000/`. Dit is de hoofdpagina van de applicatie. Er is ook een swaggerpagina opgezet. Hier wordt toegelicht hoe al de routes zijn geïmplementeerd en kunnen deze ook getest worden. Deze pagina is te vinden op `http://157.193.171.84:3000/docs`. Er is geen authenticatie voorzien.

De manier waarop in ons project een websocket voorzien is, is door in realtime nieuwe comments toe te voegen. Dit kan gedaan worden door hetzelfde artikel open te klikken in 2 aparte tabbladen en dan in het ene een comment te posten. Dit zou normaal direct moeten verschijnen in het andere tabblad.
