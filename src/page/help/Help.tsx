import * as React from 'react'
import BaseLayout from '../../layout/BaseLayout'
import './Help.css'

class Help extends React.Component {
    constructor(props: any) {
        super(props)
    }

    state = {}

    public render(): any {
        return (
            <BaseLayout pages="help">
                <div className="jia-content">
                    <pre>
                        {`          
 1、定时任务格式：
    Second Minute Hour Day Month Week
    秒 分钟 小时 天 月 星期
    0-59 0-59 0-23 1-31 1-12 0-6
    Second 每分钟第几秒执行
    Minute 每个小时的第几分钟执行该任务
    Hour 每天的第几个小时执行该任务
    Day 每月的第几天执行该任务
    Month 每年的第几个月执行该任务
    DayOfWeek 每周的第几天执行该任务，0表示周日

 2、特殊符号含义
    "*"代表取值范围内的所有数字,
    "/"代表 "每",
    "L"代表每月的最后一天仅可在月中使用
    “-”代表从某个数字到某个数字,
    “,”分开几个离散的数字

 3、一些事例
    5  * * * * * 每分钟的第5分钟执行
    30 5 * * * * 每小时的第5:30执行
    30 7 8 * * * 每天的08:07:30执行
    30 5 8 6 * * 每月的6日8时5分30秒执行
    30 6 12 * * 0 每星期日的12:06:30执行[注：0表示星期天，1表示星期1，以此类推]
    30 3 10,20 * * * 每天10点及20点的03：30执行[注：“，”用来连接多个不连续的时段]
    25 8-11 * * * * 每小时的8-11分的第25秒执行[注：“-”用来连接连续的时段]
    */15 * * * * * 每15秒执行一次 [即每个分钟的第0 15 30 45 60秒执行 ]
    1 30 6 */10 * * 每月中，每隔10天的第6:30:1执行一次[即每月的1、11、21、31日是的6：30:1执行一次 ]
    10,20,30 * * * * * 每分钟的第10、20、30秒执行
                    `}
                    </pre>
                </div>
            </BaseLayout>
        )
    }
}

export default Help
