import { TextComponent } from "obsidian";

export function wrapTypePassword(component: TextComponent): TextComponent {
	component.inputEl.type = "password";
	component.inputEl.addEventListener("focus", () => {
		component.inputEl.type = "text";
	});
	component.inputEl.addEventListener("blur", () => {
		component.inputEl.type = "password";
	});
	return component;
}
