interface AddAndRemoveClasses {
  elementNode: HTMLElement;
  enabledClass: string;
  disabledClass: string;
}

export function addAndRemoveClasses({ elementNode, enabledClass, disabledClass }: AddAndRemoveClasses) {
  if (elementNode.classList.contains(disabledClass)) {
    elementNode.classList.remove(disabledClass);
    elementNode.classList.add(enabledClass);
    return;
  }

  elementNode.classList.remove(enabledClass);
  elementNode.classList.add(disabledClass);
}