<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

1. Clonar el repositorio
2. Copiar el archivo ```.env.example``` y renombrar a ```.env```
3. Instalar dependencias: 
```
yarn
```
4. Levantar la imagen de la base de datos: 
```
docker-compose up -d
```
5. Levantar backend de Nest: 
```
yarn start:dev
```
6. Visitar:
```
http://localhost:3000/graphql
```
7. Ejecutar la __"mutation"__ executeSeed, para poblar la base de datos
