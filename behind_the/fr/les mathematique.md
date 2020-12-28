# Les Mathématiques

## Introduction
Il est normale dans ce domaine de se confronter a tout l'aspect mathématique.  
Des codes tout fait, il en existe un packet sur le web. Donc trouver son bonheur n'est pas très difficile mais quand on commence a rentrer dans des sujets plus pointus où peu de personnes ont mit les pieds, cela devient vital de savoir et de comprendre ce que l'on fait et si vous etes arrivé sur ce document, cela n'est pas un hasard.  
Je vais donc expliquer avec mes connaissances tout ce que je sais sur les fonctions mathématiques les plus utilisés

Tous les exemples seront fait avec ThreeJS et n'incluront pas l'initalisation de la lib ThreeJ par soucis de différenciation front et back.

### Vector (Vecteur)

Lorsqu'on commence la programation dans le jeu vidéo (ou autre) on arrive très rapidement sur les vecteurs.
Les premières fois où on en entend parler, c'est dans nos cours de math avec un plan (2D ou 3D) et représenté par une fleche.

![Vecteurs](https://www.mathforu.com/assets/img/image-20181014152737.png)

Dans le monde de la programation, nous pouvons garder cette vision. Mais la notion de vecteur ne se limite pas à cela.

Pour faire très simple, un vecteur est un tableau (array) de valeur. 
Les vecteur peuvent contenir plusieurs "type" d'information comme des longueurs, des positions dans l'espace, des orientations (radians, degrées) etc ...

Liste de vecteur connu:
| Tableau(array) | Type d'info | [0] | [1] | [2] | [3] |
|--|--|--|--|--|--|
| vec2 | position (x,y) | 2 | 5 |
| vec3 | orientation (x,y,z) | 0 | 359 | 90 |
| vec4 | couleur (r,b,g,a) | 0 | 255 | 5 | 6 |

Vu qu'un plan 3D est toujours désigné sur ses 3 axes par X, Y et Z, les moteurs de jeu (engine) nous fournisse directement ces attributs:
```js
// initialisation d'un vecteur avec 3 attributs
const position = new THREE.Vector3(5, 10, 2.5)

console.log(position.x) // out: 5
console.log(position.y) // out: 10
console.log(position.z) // out: 2.5
```

### Nomalisation d'un vecteur (Normalize)
Je tiens a parler de la normalisation d'un vecteur assez tot car la elle simplifie beaucoup de calcul.

Pour faire simple normaliser un vecteur revient à faire en sorte que sa longueur (length) soit égale à 1. Il y a beaucoup de calcule utilisant des vecteurs qui on besoin de prendre en compte les longueurs des vecteur et le fait de calculer des vecteurs dont toutes les longueurs sont égales a 1 simplifie toutes les divisions et multiplication.

Toutes les explications seront faite en 2D. 
Losque vous avez un vecteur `(x:4 ; y:5)` sur un plan 2D nous pouvons le représenter comme ceci:

![Vecteur (x:4 ; y:5)](https://i.ibb.co/JpJKXRC/image.png)

Avec les coordonnées d'un vecteur nous pouvons mesurer sa longueur (**length**).
> Quand on travail avec des vecteurs sa longueur est une information importante et il n'est pas rare que les class vous donne y accès !

Mais rien ne nous empeche d'allez jeter un coup d'oeil sur l'envers du décor.  
Pour cela nous allons nous servir de Pythagore et de son theorème du triangle rectangle.


![3 vecteur pour faire un triangle rectangle](https://i.ibb.co/MCYTSk8/image.png)

Pour notre vecteur `(x:4 ; y:5)` représenté en rouge, nous pouvons le créer grace à l'addition de 2 autres vecteurs:
- `(x:4 ; y:0)` en vert
- `(x:0 ; y:5)` en bleu

Cela nous forme un beau triangle rectangle et nous allons pouvoir calculer la longueur de notre vecteur rouge !  
Théoreme de Pythagore : `u² = v² + w²`  
donc:  
![Pythagore reciproque](https://i.ibb.co/jbQCmNN/image.png)

```js
// Retourne la longueur d'un vecteur 2D
function getVector2DLength(vector) {
    const {x, y} = vector;
    return Math.sqrt(x*x + y*y);
}
```
La longueur de notre vecteur `(x:4 ; y:5)` rouge:  
![Pythagore reciproque](https://i.ibb.co/XkB7J8J/image.png)

Maintenant que nous avons la longueur de notre vecteur nous allons pouvoir le normaliser en divisant chaque coordonnée par sa longueur:

```js
function normalize(vector) {
    const {x, y} = vector;
    const length = Math.sqrt(x*x + y*y);

    vector.x /= length;
    vector.y /= length;

    return vector;
}
```
> Il est à noté que nous voulons toujours avoir une valeur positive sur la longueur d'un vecteur: certain serait donc tenté de rajouter un Math.abs(length). Mais souvenez vous que le résultat d'un nombre négatif multiplié par lui même est toujours positif !

Le vecteur normalisé est représenté par `u'` en noir sur cette dernière image.  
Le cercle à un rayon de 1 ce qui permet de vérifié géometriquement que notre vecteur normalisé `u'` fait bien 1 de longueur !
![Représentation générale](https://i.ibb.co/vJwVS94/image.png)

### Dot product (Produit scalaire)

Le produit scalaire est très souvent utilisé pour connaitre la différence angulaire entre 2 vecteurs  
Il est possible d'avoir cette différence en degrée mais il est très que cela soit fait:
- d'une part parce qu'il est rare que les calcules soient fait en degrée
- et d'une autre part parce que les calcules se complexifies

> Si nous normalisons les vecteurs avant de les envoyer dans la fonction `dot()`, nous allons pouvoir avoir des résultats entre -1 et 1.  
> ou 1 signifie que les vecteurs pointe dans la meme direction  
> ou 0 signifie que les vecteur sont perpendiculaire  
> ou -1 signifie que les vecteurs pointe de manière opposés

```js
function dot(vector1, vector2) {
    return vector1.x * vector2.x - vector1.y * vector2.y;
}
```

Deux exemples  
![Représentation générale](https://i.imgur.com/G2ZKuX2.gif)
![Représentation générale](https://i.imgur.com/Le4bqVF.gif)

Pour plus d'information, n'hésité à regarder sur le net !

> Il doit y avoir d'autre utilité et je rajouterai au fur et mesure que je découvrerai des choses !

### Cross product (Produit vectoriel)
