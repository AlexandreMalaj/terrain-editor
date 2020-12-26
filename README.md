# Three JS Terrain Editor

The main goal of this projet is to acheive a system that can edit a terrain (plane geometry) and paint multiple textures.

I use [ThreeJS](https://threejs.org/) which is a Javascript WebGL library.

## Requirements
- [Node.js](https://nodejs.org/en/) v14 (Need ESM)

## Getting Started

After clone
```bash
$ npm i
$ npm start
```

## Movement

### Camera
`ZQSD` to move Camera  
`Shift/Space` for Up/Down Camera  
`Middle Mouse Button` to rotate Camera

### Editing mode
`Tab` to change Editing Mode (vertex/planes/textures)  
> Only vertex editing mode work

### Vertex editing
When in vertex editing mode:

`1/2/3` above AZE on keybord:  
1: Raise = Left Mouse Click / Lower = Right Mouse Click  
2: Flatten = Left Mouse Click (flatten all point from the heigh where you click)
3: Smooth = Left Mouse Click