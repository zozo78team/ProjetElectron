// Necessaire pour le bon fonctionnement en allant chercher des infos de index.html

import { ipcRenderer, IpcRendererEvent } from "electron";
import * as fs from "fs";

window.addEventListener("DOMContentLoaded", () => {
    const btn: HTMLElement = document.getElementById("folderchooser");

    btn.addEventListener("click", (ev: Event) => {
        ipcRenderer.send("showFolderDialog");
    });
});

document.getElementById("clearselection").addEventListener("click", () => {
    const selectionField = document.getElementById("selectedfolders") as HTMLInputElement;
    selectionField.value = "";
    document.getElementsByTagName("ul")[0].innerHTML = "";
});

ipcRenderer.on("selectedfolders", (evt: IpcRendererEvent, selectedfolders: string[]) => {
    const selectedFolderElem: HTMLInputElement = document.getElementById("selectedfolders") as HTMLInputElement;
    selectedFolderElem.value = selectedFolderElem.value !== "" ? selectedFolderElem.value + "|"
                                                            : selectedFolderElem.value ;
    selectedFolderElem.value += selectedfolders.join(" | ");
});

ipcRenderer.on("fileslist", (event: IpcRendererEvent, fileName: string, stats: fs.Stats) => {
    const filetemplate = document.getElementById("filerec") as HTMLTemplateElement;
    const filedisplayrec = filetemplate.content;
    const spanElements = filedisplayrec.querySelectorAll("span");
    spanElements[0].innerText = fileName;
    spanElements[1].innerText = stats.size.toString();
    spanElements[2].innerText = stats.mtime.toString();
    const nodeElement: Node = filedisplayrec.cloneNode(true);

    document.getElementById("filelist").appendChild(nodeElement);

});