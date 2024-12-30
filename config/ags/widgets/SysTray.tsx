import { Gdk, Gtk } from "astal/gtk3";
import { bind, Variable, Gio } from "astal";
import Tray from "gi://AstalTray";
import TrayItem from "gi://AstalTray";

// function SysTray() {
//     const tray = Tray.get_default()

//     return <box spacing={8} className="SysTray">
//         {bind(tray, "items").as(items => items.map(item => {
//             if (item.iconThemePath)
//                 App.add_icons(item.iconThemePath)

//             // const menu = item.create_menu()
//             return <button
//                 tooltip-markup={bind(item, "tooltipMarkup")}
//                 // onDestroy={() => menu?.destroy()}
//                 onClickRelease={self => {
//                     // menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null)
//                 }}>
//                 <icon g-icon={bind(item, "gicon")} />
//             </button>
//         }))}
//     </box>
// }

// function SysTray() {
//     const tray = Tray.get_default()

//     return <box spacing={6} className="SysTray">
//         {bind(tray, "items").as(items => items.map(item => (
//             <menubutton
//                 tooltipMarkup={bind(item, "tooltipMarkup")}
//                 usePopover={false}
//                 actionGroup={bind(item, "action-group").as(ag => ["dbusmenu", ag])}
//                 menuModel={bind(item, "menu-model")}>
//                 <icon gicon={bind(item, "gicon")} />
//             </menubutton>
//         )))}
//     </box>
// }

function createMenu(menuModel: Gio.MenuModel, actionGroup: Gio.ActionGroup): Gtk.Menu {
	const menu: Gtk.Menu = Gtk.Menu.new_from_model(menuModel);
	menu.insert_action_group("dbusmenu", actionGroup);
	return menu;
}

function SysTrayItem(trayItem: TrayItem) {
    let menu: Gtk.Menu;
    const entryBinding = Variable.derive(
        [bind(trayItem, 'menuModel'), bind(trayItem, 'actionGroup')],
        (menuModel, actionGroup) => {
            if (!menuModel) {
                return console.error(`Menu Model not found for ${trayItem.id}`);
            }
            if (!actionGroup) {
                return console.error(`Action Group not found for ${trayItem.id}`);
            }

            menu = createMenu(menuModel, actionGroup);
        }
    )

	const button = (
		<button
			className="systray-item"
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			tooltip_markup={bind(trayItem, "tooltip_markup")}
			focus_on_click={false}
			use_underline={false}
			onClick={(self, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					trayItem.activate(0, 0)
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH_EAST, null)
				}
			}}
		>
			<icon gicon={bind(trayItem, "gicon")} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
		</button>
	)

	menu.connect("notify::menu-model", () => {
		const newMenu = createMenu(trayItem.menuModel, trayItem.actionGroup);
		menu.destroy();
		menu = newMenu;
	});

	menu.connect("notify::action-group", () => {
		const newMenu = createMenu(trayItem.menuModel, trayItem.actionGroup);
		menu.destroy();
		menu = newMenu;
	});

	return button
}

export default function SysTray() {
    const tray = Tray.get_default()

    return <box spacing={6} className="SysTray">
        {bind(tray, "items").as(items => items.map(item => (
            SysTrayItem(item)
        )))}
    </box>
}