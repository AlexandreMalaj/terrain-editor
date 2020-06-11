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

ZQSD for Moving Camera  
Shift/Space for Up/Down Camera  
Middle Mouse button to rotate Camera  

> Care about rotation on X axis (they is no limit currently)


Tab to change Mode (Edit vertex/Edit planes/Edit texture)  
> Only vertex editing mode work


When in vertex editing mode:  
1/2/3 above AZE on keybord  
1: Raise = Left Mouse Click / Lower = Right Mouse Click  
2: Flatten = Left Mouse Click  
3: Smooth = Left Mouse Click
