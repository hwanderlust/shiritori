import * as _ from 'lodash';
import Menu from "./menu";
import "../styles/index.scss";

const menuInstance = Menu();

window.addEventListener("DOMContentLoaded", _ => {
  menuInstance.addListeners();
});