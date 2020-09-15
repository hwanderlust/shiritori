import * as _ from 'lodash';
import Menu from "./menu";
import Game from "./game";
import "../styles/index.scss";

const menuInstance = Menu();
const gameInstance = Game();

window.addEventListener("DOMContentLoaded", _ => {
  menuInstance.addListeners();
  gameInstance.addListeners();
});