import * as _ from 'lodash';
import Menu from "./menu";
import Game from "./game";
import Music from "./music";
import "../styles/index.scss";

const menuInstance = Menu();
const gameInstance = Game();
Music();

window.addEventListener("DOMContentLoaded", _ => {
  menuInstance.addListeners();
  gameInstance.addListeners();
});