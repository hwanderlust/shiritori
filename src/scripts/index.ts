import * as _ from 'lodash';
import Menu from "./menu";
import InitGame from "./initGame";
import "../styles/index.scss";

const menuInstance = Menu();
const initGameInstance = InitGame();

window.addEventListener("DOMContentLoaded", _ => {
  menuInstance.addListeners();
  initGameInstance.addListeners();
});