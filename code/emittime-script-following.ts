// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: user-md;

import { createTextWidget, getDataWithSecret, handleError } from "./utils";

interface FollowingData {
    self: {
        initials: string;
        color: string;
        timePoints: string;
    };
    followings: {
        initials: string;
        color: string;
        timePoints: {
            name: string;
            distance: string;
        }[];
    }[];
}

getDataWithSecret<FollowingData>(secret => `http://macbook-pro.local:3000/api/ios-widgets/${secret}/following`)
    .then(async (response) => {
        if (!response.ok) {
            return await handleError()
        }
        const { self, followings } = response.data;

        if (config.runsInWidget) {
            const widget = createTextWidget(
                `${self.initials}: ${self.timePoints}`,
                self.timePoints,
                followings.map(f => `${f.initials} ${f.timePoints.map(t => t.name).join("")}`).join(""),
                self.color)
            Script.setWidget(widget)
            Script.complete()
        } else {
            // make table
            const table = new UITable()

            addFollowingHeaderRow(table, `${self.initials}: ${self.timePoints}`, self.color)

            for (let following of followings) {
                addFollowingHeaderRow(table, following.initials, following.color);
                for (let timePoint of following.timePoints) {
                    addFollowingRow(table, timePoint.name, timePoint.distance);
                }
            }

            // if (config.runsWithSiri)
            //     Speech.speak(`${title}`)

            // present table
            table.present()
        }
    })

function addFollowingHeaderRow(table: UITable, title: string, color: string) {
    let row = new UITableRow()
    row.isHeader = true;
    const cell = row.addText("•")
    cell.titleColor = new Color(color, 1);
    row.addText(title)
    table.addRow(row)
}
function addFollowingRow(table: UITable, name: string, distance: string) {
    let row = new UITableRow()
    row.addText(name)
    row.addText(distance).rightAligned()
    table.addRow(row)
}

// function createFollowingWidget({ self, followings }: FollowingData) {
//     let w = new ListWidget()
//     // w.url = "https://emittime.app"
//     w.backgroundColor = new Color(color, 1)
//     let preTxt = w.addText(pretitle)
//     preTxt.textColor = Color.white()
//     preTxt.textOpacity = 0.8
//     preTxt.font = Font.systemFont(10)
//     w.addSpacer(5)
//     let titleTxt = w.addText(title)
//     titleTxt.textColor = Color.white()
//     titleTxt.font = Font.systemFont(16)
//     w.addSpacer(5)
//     let subTxt = w.addText(subtitle)
//     subTxt.textColor = Color.white()
//     subTxt.textOpacity = 0.8
//     subTxt.font = Font.systemFont(12)

//     // @ts-ignore
//     w.addSpacer(null)
//     let a = w.addText("")
//     a.textColor = Color.white()
//     a.textOpacity = 0.8
//     a.font = Font.systemFont(12)
//     return w
// }
