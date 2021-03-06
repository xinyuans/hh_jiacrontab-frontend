import * as React from 'react'
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
// import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Input,
    InputNumber,
    Button,
    Checkbox,
    Select,
    Row,
    Tooltip,
    Col,
    Radio,
} from 'antd';
import BaseLayout from '../../layout/BaseLayout'
import { getUrlParam, getRequest, getGroupID, trimEmpty } from '../../utils/utils'
import API from '../../config/api'
import Bread from '../../components/Layout/Bread'
// import { FormComponentProps } from '@ant-design/compatible/lib/form';
import Status from 'src/config/status'
const { Option } = Select

// interface EditProps extends FormComponentProps {
//     history: any
// }
interface Props { 
    history: any
}

interface State {
    token: any,
    loading: boolean,
    defaultObject: object,
    userInfo: any,
    nodeList: any,
    formRef: React.RefObject<FormInstance>,
    relyArray: any,
    initialValues: any
}
class Add extends React.Component<Props,State> {
    public state: State
    constructor(props: Props) {
        super(props)
        this.state = {
            token: '',
            loading: false,
            defaultObject: this.defObj,
            userInfo: {
                mail: ''
            },
            nodeList: [],
            formRef: React.createRef<FormInstance>(),
            relyArray: [],
            initialValues: {}
        }
    }

    private defObj: {
        mailTo: string[]
        APITo: string[]
        DingdingTo: string[]
        workEnv: string[]
        command: string[]
        timeArgs: any
        dependJobs: any
    } = {
            mailTo: [],
            APITo: [],
            DingdingTo: [],
            workEnv: [],
            command: [],
            timeArgs: {},
            dependJobs: []
        }
    

    public componentDidMount() {
        if (window.localStorage) {
            this.setState(
                {
                    token: localStorage.getItem('jiaToken'),
                    userInfo: JSON.parse(
                        localStorage.getItem('userInfo') || '{}'
                    )
                },
                () => {
                    this.getNodeList()

                    if (getUrlParam('id', this.props.history.location.search)) {
                        const id: number = Number(
                            getUrlParam(
                                'id',
                                this.props.history.location.search
                            )
                        )
                        const addr: any = getUrlParam(
                            'addr',
                            this.props.history.location.search
                        )
                        this.getDefaultData(id, addr, this.state.token)
                    } else {
                        this.defObj.mailTo = [this.state.userInfo.mail]
                        
                        const propsAddr2 = getUrlParam(
                            'addr',
                            this.props.history.location.search
                        )
                        let initCurrentValues = {
                            addr: propsAddr2,
                        }

                        this.setState({
                            initialValues: initCurrentValues
                        })
                        setTimeout(() => {
                            this.state.formRef.current?.resetFields()
                            this.state.formRef.current?.setFieldsValue({ initialValues: initCurrentValues})
                        },10)
                        
        
                        this.setState({
                            defaultObject: this.defObj
                        })
                        
                        
                    }
                }
            )
        }
    }
    // public 

    private getDefaultData = (id: number, addr: string, jiaToken: string) => {
        
        getRequest({
            url: API.getTaskList,
            token: jiaToken,
            data: {
                addr: addr,
                jobID: id
            },
            succ: (data: any) => {
                const propsAddr1 = getUrlParam(
                    'addr',
                    this.props.history.location.search
                )
                const defaultFormValus: any = data
                const timeArgs: any = defaultFormValus.timeArgs
                let resultRely: object[] = []
                if (
                    defaultFormValus.dependJobs &&
                    defaultFormValus.dependJobs.length > 0
                ) {
                    defaultFormValus.dependJobs.map((value:any,index:number) => {
                        let defaultKey:any = {
                            isListField: true,
                            key: index,
                            relyAddr: value.dest,
                            relyCommand: value.command.join(' '),
                            relyCode: value.code,
                            relyTimeOut: value.timeout
                        }
                        resultRely.push(defaultKey)
                    })
                }
                let initCurrentValues = { 
                    addr: propsAddr1,
                    name: defaultFormValus.name,
                    command: defaultFormValus.command.join(' '),
                    code: defaultFormValus.code,
                    workDir:defaultFormValus.workDir,
                    workEnv: defaultFormValus.workEnv
                    ? defaultFormValus.workEnv.join(',')
                    : '',
                    workUser: defaultFormValus.workUser,
                    workIp: defaultFormValus.workIp
                    ? defaultFormValus.workIp.join(',')
                    : '',
                    timeout: defaultFormValus.timeout || 0,
                    timeoutTrigger: defaultFormValus.timeoutTrigger ? defaultFormValus.timeoutTrigger : [],
                    killChildProcess: defaultFormValus.killChildProcess ? ['childProcess'] : [],
                    // killChildProcess: [
                    //     defaultFormValus.killChildProcess
                    // ],
                    retryNum: defaultFormValus.retryNum || 0,
                    mailTo: defaultFormValus.mailTo
                    ? defaultFormValus.mailTo.join(',')
                    : '',
                    APITo:defaultFormValus.APITo ? defaultFormValus.APITo.join(',') : '',
                    DingdingTo:defaultFormValus.DingdingTo ? defaultFormValus.DingdingTo.join(',') : '',
                    maxConcurrent: defaultFormValus.maxConcurrent || 1,
                    second: timeArgs.second,

                    minute: timeArgs.minute,
                    hour: timeArgs.hour,
                    day: timeArgs.day,
                    weekday: timeArgs.weekday,
                    month: timeArgs.month,
                    isSync: defaultFormValus.isSync ? 'synchrony' : 'asychrony',
                    relayItem: resultRely,
                    taskError:[
                        (defaultFormValus.errorMailNotify &&
                            'errorMailNotify') ||
                        '',
                        (defaultFormValus.errorAPINotify &&
                            'errorAPINotify') ||
                        '',
                        (defaultFormValus.errorDingdingNotify &&
                            'errorDingdingNotify') ||
                        ''
                    ]
                }
                this.setState({
                    initialValues: initCurrentValues
                })

                setTimeout(() => {
                    this.state.formRef.current?.resetFields()
                    this.state.formRef.current?.setFieldsValue({ initialValues: initCurrentValues})
                },10)

                this.setState({
                    defaultObject: data
                })
            }
        })
    }
    private getNodeList() {
        getRequest({
            url: API.NodeList,
            token: this.state.token,
            data: {
                queryGroupID: getGroupID(),
                page: 1,
                pagesize: 1000
            },
            succ: (data: any) => {
                let templeListData = data
                this.setState({
                    nodeList: templeListData.list
                })
            }
        })
    }
    private handleSubmit = (values: any) => {
        this.state.formRef.current?.validateFields().then((values: any) => {
            this.addEditorList(this.state.token, this.parseValues(values))
        })
    }
    private parseValues = (values: any) => {
        let newPrams: any = {
            addr: values.addr,
            isSync: values.isSync === 'synchrony' ? true : false,
            name: values.name,
            command: trimEmpty(values.command.split(' ')),
            code: values.code,
            maxConcurrent: values.maxConcurrent,
            killChildProcess: values.killChildProcess && values.killChildProcess.includes('childProcess')
            ? true
            : false,
            second: values.second,
            minute: values.minute,
            hour: values.hour,
            day: values.day,
            weekday: values.weekday,
            month: values.month,
            dependJobs: []
        }
        if (getUrlParam('id', this.props.history.location.search)) {
            newPrams.jobID = Number(
                getUrlParam('id', this.props.history.location.search)
            )
        }
        if (values.mailTo !== undefined) {
            newPrams.mailTo = trimEmpty(values.mailTo.split(','))
        }
        if (values.APITo !== undefined) {
            newPrams.APITo = trimEmpty(values.APITo.split(','))
        }
        if (values.DingdingTo !== undefined) {
            newPrams.DingdingTo = trimEmpty(values.DingdingTo.split(','))
        }
        if (values.timeoutTrigger !== undefined) {
            newPrams.timeoutTrigger = values.timeoutTrigger
        }

        if (values.workEnv !== undefined) {
            newPrams.workEnv = trimEmpty(values.workEnv.split(','))
        }

        if (values.workIp !== undefined) {
            newPrams.workIp = trimEmpty(values.workIp.split(','))
        }

        newPrams.errorMailNotify = values.taskError && values.taskError.includes('errorMailNotify')
            ? true
            : false

        newPrams.errorAPINotify = values.taskError && values.taskError.includes('errorAPINotify')
            ? true
            : false

        newPrams.errorDingdingNotify = values.taskError && values.taskError.includes('errorDingdingNotify')
            ? true
            : false

        if (values.workDir !== undefined) {
            newPrams.workDir = values.workDir
        }
        if (values.workUser !== undefined) {
            newPrams.workUser = values.workUser
        }
        //if (values.workIp !== undefined) {
            //newPrams.workIp = values.workIp
        //}
        if (values.timeout !== undefined) {
            newPrams.timeout = values.timeout
        }
        if (values.retryNum !== undefined) {
            newPrams.retryNum = values.retryNum
        }

        if (values.relayItem && values.relayItem.length > 0) {
            values.relayItem.map((item: any) => {
                newPrams.dependJobs.push({
                    from: values.addr,
                    dest: item.relyAddr,
                    command: trimEmpty(item.relyCommand.split(' ')),
                    code: item.relyCode,
                    timeout: Number(item.relyTimeOut)
                })
            })
        }
        return newPrams
    }
    private addEditorList = (jiaToken: string, values: object) => {
        this.setState({
            loading: true
        })
        getRequest({
            url: API.edit,
            token: jiaToken,
            data: values,
            succ: (data: any) => {
                this.setState(
                    {
                        loading: false
                    },
                    () => {
                        let params: any = {
                            id: getUrlParam(
                                'id',
                                this.props.history.location.search
                            ),
                            addr: getUrlParam(
                                'addr',
                                this.props.history.location.search
                            ),
                            tabKey: getUrlParam(
                                'tabKey',
                                this.props.history.location.search
                            )
                        }
                        let path: any = {
                            pathname: '/node/detail',
                            search: `?id=${params.id}&addr=${
                                params.addr
                                }&tabKey=${params.tabKey}`
                        }
                        this.props.history.push(path)
                    }
                )
            },
            error: () => {
                this.setState({
                    loading: false
                })
            },
            catch: () => {
                this.setState({
                    loading: false
                })
            }
        })
    }


    

    public render(): any {
        const { nodeList,initialValues } = this.state
        let defaultFormValus: any = this.state.defaultObject

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 14 }
        }
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: { span: 14, offset: 3 },
                sm: { span: 14, offset: 3 }
            }
        }

        
        const propsId = getUrlParam('id', this.props.history.location.search)
        const propsAddr = getUrlParam(
            'addr',
            this.props.history.location.search
        )

        const propsTabKey = getUrlParam(
            'tabKey',
            this.props.history.location.search
        )

        return (
            <BaseLayout pages="nodeList">
                <div className="jia-content">
                    <Bread
                        paths={[
                            {
                                id: 'first',
                                name: '????????????',
                                icon: 'ff',
                                route: '/node/list'
                            },
                            {
                                id: 'first2',
                                name: propsAddr,
                                icon: 'ss',
                                route: {
                                    pathname: '/node/detail',
                                    search: `?id=${propsId}&addr=${propsAddr}&tabKey=${propsTabKey}`
                                }
                            },
                            {
                                id: 'first3',
                                name:
                                    propsTabKey == '2'
                                        ? '??????????????????'
                                        : '??????????????????',
                                icon: 'ss',
                                route: '/edit/crontab_job'
                            }
                        ]}
                    />
                    <Card size="small" title="??????????????????">
                        <Form 
                        onFinish={this.handleSubmit} 
                        ref={this.state.formRef}
                        initialValues={initialValues}
                        >
                            
                            <Form.Item 
                                {...formItemLayout} 
                                label="??????" 
                                name="addr"
                                rules={[{ required: true, message: '???????????????' }]}
                            >
                                
                                <Input
                                    placeholder="???????????????"
                                    disabled
                                />
                                
                            </Form.Item>
                            

                            <Form.Item 
                                {...formItemLayout} 
                                label="????????????" 
                                name="name"
                                validateTrigger={['onChange','onBlur']}
                                rules={[{ required: true, message: '?????????????????????' }]}
                            >
                                <Input placeholder="?????????????????????"/>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label={
                                    <span>
                                        ??????&nbsp;
                                        <Tooltip title="??????????????????????????????????????????????????????'ls -l,uname -a',??????????????????????????????????????????????????????????????????????????????'??????'??????????????????????????????">
                                            <QuestionCircleOutlined />
                                        </Tooltip>
                                    </span>
                                }
                                style={{ marginBottom: 6 }}
                                name="command"
                                rules={[{ required: true, message: '???????????????' }]}
                            >
                                
                                <Input placeholder="???????????????,????????????'sh -c'???'php -r'???'python -c'" />
                                
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label={
                                    <span>
                                        ??????&nbsp;
                                        <Tooltip title="????????????sh -c,python -c,php -r??????????????????????????????????????????????????????">
                                            <QuestionCircleOutlined />
                                        </Tooltip>
                                    </span>
                                }
                                name="code"
                            >
                                
                                <Input.TextArea
                                    autoSize={{ minRows: 4, maxRows: 12 }}
                                    placeholder="?????????????????????????????????"
                                />
                                
                            </Form.Item>

                            <Form.Item 
                                {...formItemLayout} 
                                label="????????????" 
                                name="workDir"
                            >
                                <Input placeholder="?????????????????????" />
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="????????????" name="workEnv">
                                
                                <Input placeholder="??????????????????????????????key=value????????????????????????????????????" />
                                
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="????????????" name="workUser">
                                <Input placeholder="????????????" />
                            </Form.Item>

                            <Form.Item {...formItemLayout}
                                label={
                                    <span>
                                        IP??????&nbsp;
                                        <Tooltip title="??????????????????????????????IP?????????IP?????????????????????????????????????????????????????????????????????">
                                            <QuestionCircleOutlined />
                                        </Tooltip>
                                    </span>
                                }
                                name="workIp"
                            >
                                
                                <Input placeholder="?????????192.168.0.1/24?????????192.168.0.1?????????????????????????????????????????????" />
                                
                            </Form.Item>

                            <Form.Item {...formItemLayout} label="????????????" >
                                <Form.Item noStyle name="timeout">
                                    <InputNumber
                                        style={{ width: 120 }}
                                        min={0}
                                        placeholder="????????????"
                                    />
                                </Form.Item>
                                <span className="ant-form-text">???</span>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="????????????" name="timeoutTrigger">
                                
                                <Checkbox.Group>
                                    <Checkbox value="SendEmail">
                                        ????????????
                                    </Checkbox>
                                    <Checkbox value="CallApi">
                                        api??????
                                    </Checkbox>
                                    <Checkbox value="DingdingWebhook">
                                        ????????????
                                    </Checkbox>
                                    <Checkbox value="Kill">??????</Checkbox>
                                </Checkbox.Group>
                                
                            </Form.Item>

                            <Form.Item {...formItemLayout} label="?????????" name="killChildProcess">
                                
                                <Checkbox.Group>
                                    <Checkbox value="childProcess">
                                        ?????????????????????????????????????????????
                                    </Checkbox>
                                </Checkbox.Group>
                                
                            </Form.Item>

                            <Form.Item {...formItemLayout} label="??????????????????" name="retryNum">
                                
                                <InputNumber
                                    style={{ width: 150 }}
                                    min={0}
                                    placeholder="??????????????????"
                                />
                                
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="????????????" name="mailTo">
                                
                                <Input placeholder="?????????????????????,???????????????????????????" />
                                
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="api??????" name="APITo">
                                
                                <Input placeholder="?????????api??????,???????????????????????????" />
                                
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="??????webhook??????" name="DingdingTo">
                                
                                <Input placeholder="???????????????webhook????????????????????????????????????,???????????????????????????" />
                                
                            </Form.Item>
                            <Form.Item 
                                {...formItemLayout} 
                                label="???????????????" 
                                name="maxConcurrent"
                                rules={[{ required: true, message: '????????????????????????' }]}
                            >
                                <InputNumber min={1} />
                            </Form.Item>

                            <Row>
                                <Col span={3}>
                                    <div className="tast-timing">??????:</div>
                                </Col>
                                <Col span={14}>
                                    <Row>
                                        <Col span={3}>
                                            <Form.Item
                                                wrapperCol={{
                                                    span: 20,
                                                    offset: 0
                                                }}
                                                name="second"
                                                rules={[{ required: true, message: 'second' }]}
                                            >
                                                
                                                <Input placeholder="second" />
                                                
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                wrapperCol={{
                                                    span: 20,
                                                    offset: 0
                                                }}
                                                name="minute"
                                                rules={[{ required: true, message: 'minute' }]}
                                            >
                                                
                                                <Input placeholder="minute" />
                                                
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                wrapperCol={{
                                                    span: 20,
                                                    offset: 0
                                                }}
                                                name="hour"
                                                rules={[{ required: true, message: 'hour' }]}
                                            >
                                                
                                                <Input placeholder="hour" />
                                                
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                wrapperCol={{
                                                    span: 20,
                                                    offset: 0
                                                }}
                                                name="day"
                                                rules={[{ required: true, message: 'day' }]}
                                            >
                                                <Input placeholder="day" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                wrapperCol={{
                                                    span: 20,
                                                    offset: 0
                                                }}
                                                name="weekday"
                                                rules={[{ required: true, message: 'weekday' }]}
                                            >
                                                
                                                <Input placeholder="weekday" />
                                                
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item
                                                wrapperCol={{
                                                    span: 20,
                                                    offset: 0
                                                }}
                                                name="month"
                                                rules={[{ required: true, message: 'month' }]}
                                            >
                                                
                                                <Input placeholder="month" />
                                                
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <Form.Item
                                {...formItemLayout}
                                label="????????????"
                                style={{ marginBottom: 6 }}
                                name="isSync"
                            >
                                
                                <Radio.Group>
                                    <Radio value="synchrony">
                                        ????????????
                                    </Radio>
                                    <Radio value="asychrony">
                                        ????????????
                                    </Radio>
                                </Radio.Group>
                                
                            </Form.Item>

                            <Form.List name="relayItem">
                            {(fields, { add, remove }) => {
                                return (
                                    <>

                                    {fields.map(field => (
                                        <Row key={field.key} >
                                            <Col span={3} />
                                            <Col span={14}>
                                                <Row>
                                                    <Col span={6}>
                                                        <Form.Item
                                                            wrapperCol={{
                                                                span: 24,
                                                                offset: 0
                                                            }}
                                                            {...field}
                                                            name={[field.name, 'relyAddr']}
                                                            rules={[{ required: true, message: '????????????????????????' }]}
                                                        >
                                                            
                                                            <Select placeholder="????????????????????????">
                                                                {nodeList.map(
                                                                    (item: any) => {
                                                                        return (
                                                                            <Option
                                                                                key={
                                                                                    item[
                                                                                    'ID'
                                                                                    ]
                                                                                }
                                                                                value={
                                                                                    item[
                                                                                    'addr'
                                                                                    ]
                                                                                }
                                                                            >
                                                                                {
                                                                                    item[
                                                                                    'addr'
                                                                                    ]
                                                                                }
                                                                            </Option>
                                                                        )
                                                                    }
                                                                )}
                                                            </Select>
                                                            
                                                        </Form.Item>
                                                    </Col>
                                                    <Col
                                                        span={4}
                                                        style={{ marginLeft: 10 }}
                                                    >
                                                        <Form.Item
                                                            wrapperCol={{
                                                                span: 24,
                                                                offset: 0
                                                            }}
                                                            {...field}
                                                            name={[field.name, 'relyCommand']}
                                                            rules={[{ required: true, message: '???????????????' }]}
                                                        >
                                                            
                                                            <Input placeholder="???????????????" />
                                                            
                                                        </Form.Item>
                                                    </Col>
                                                    <Col
                                                        span={6}
                                                        style={{ marginLeft: 10 }}
                                                    >
                                                        <Form.Item
                                                            wrapperCol={{
                                                                span: 24,
                                                                offset: 0
                                                            }}
                                                            {...field}
                                                            name={[field.name, 'relyCode']}
                                                            rules={[{ required: true, message: '???????????????' }]}
                                                        >
                                                            
                                                            <Input placeholder="???????????????" />
                                                            
                                                        </Form.Item>
                                                    </Col>
                                                    <Col
                                                        span={3}
                                                        style={{ marginLeft: 10 }}
                                                    >
                                                        <Form.Item
                                                            wrapperCol={{
                                                                span: 24,
                                                                offset: 0
                                                            }}
                                                            {...field}
                                                            name={[field.name, 'relyTimeOut']}
                                                            rules={[{ required: true, message: '??????' }]}
                                                        >
                                                            
                                                            <InputNumber
                                                                min={0}
                                                                placeholder="??????(s)"
                                                                style={{
                                                                    marginRight: 8
                                                                }}
                                                            />
                                                            
                                                        </Form.Item>
                                                    </Col>
                                                    <Col
                                                        span={3}
                                                        style={{ marginLeft: 10 }}
                                                    >
                                                        <Form.Item
                                                            wrapperCol={{
                                                                span: 24,
                                                                offset: 1
                                                            }}
                                                        >
                                                            <MinusCircleOutlined
                                                                className="dynamic-delete-button"
                                                                style={{ margin: '0 8px' }}
                                                                onClick={() => {
                                                                    remove(field.name);
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        
                                    ))}

                                    <Form.Item {...formItemLayoutWithOutLabel}>
                                        <Button
                                            htmlType="button"
                                            type="dashed"
                                            onClick={() => {
                                                add();
                                            }}
                                            style={{ width: '40%' }}
                                        >
                                            <PlusOutlined /> ????????????1
                                        </Button>
                                    </Form.Item>

                                    </>
                                )
                            }}
                            </Form.List>

                            <Form.Item {...formItemLayoutWithOutLabel} name="taskError">
                                
                                <Checkbox.Group>
                                    <Checkbox value="errorMailNotify">
                                        ??????????????????????????????
                                    </Checkbox>
                                    <Checkbox value="errorAPINotify">
                                        ??????????????????api??????
                                    </Checkbox>
                                    <Checkbox value="errorDingdingNotify">
                                        ??????????????????????????????
                                    </Checkbox>
                                </Checkbox.Group>
                                
                            </Form.Item>
                            <Form.Item {...formItemLayoutWithOutLabel}>
                                <Button
                                    htmlType="submit"
                                    className="ant-btn-primary"
                                    loading={this.state.loading}
                                >
                                    {(() => {
                                        if (
                                            defaultFormValus.status ===
                                            Status.StatusJobUnaudited &&
                                            (this.state.userInfo.root ||
                                                this.state.userInfo.groupID ===
                                                1)
                                        ) {
                                            return '????????????'
                                        } else {
                                            return '????????????'
                                        }
                                    })()}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </BaseLayout>
        );
    }
}

export default Add
