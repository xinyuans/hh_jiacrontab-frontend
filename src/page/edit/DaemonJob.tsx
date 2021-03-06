import * as React from 'react'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
// import '@ant-design/compatible/assets/index.css';
import { Card, Input, InputNumber, Button, Checkbox, Tooltip, Switch } from 'antd';
import BaseLayout from '../../layout/BaseLayout'
import { getUrlParam, getRequest, trimEmpty } from '../../utils/utils'
import API from '../../config/api'
import Bread from '../../components/Layout/Bread'
// import { FormComponentProps } from '@ant-design/compatible/lib/form';
import Status from 'src/config/status'

// interface AddProps extends FormComponentProps {
//     history: any
// }
interface Props { 
    history: any
}
interface State {
    token: any,
    loading: boolean,
    userInfo: any,
    defaultObject: any,
    formRef: React.RefObject<FormInstance>,
    initialValues: any
}

class EditDaemon extends React.Component<Props,State> {
    public state: State
    constructor(props: Props) {
        super(props)
        this.state = {
            token: '',
            loading: false,
            userInfo: {},
            defaultObject: this.defObj,
            formRef: React.createRef<FormInstance>(),
            initialValues: {}
        }
    }

    private defObj: {
        mailTo: string[]
        APITo: string[]
        DingdingTo: string[]
        WorkIp: string[]
        command: [[]]
    } = { mailTo: [], APITo: [], DingdingTo: [], WorkIp: [], command: [[]] }

    // state = {
    //     token: '',
    //     loading: false,
    //     userInfo: JSON.parse('{}'),
    //     defaultObject: this.defObj
    // }
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
    private getDefaultData = (id: number, addr: string, jiaToken: string) => {
        getRequest({
            url: API.getDaemonData,
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
                    failRestart:defaultFormValus.failRestart,
                    retryNum: defaultFormValus.retryNum || 0,
                    mailTo: defaultFormValus.mailTo
                    ? defaultFormValus.mailTo.join(',')
                    : '',
                    APITo:defaultFormValus.APITo ? defaultFormValus.APITo.join(',') : '',
                    DingdingTo:defaultFormValus.DingdingTo ? defaultFormValus.DingdingTo.join(',') : '',
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
    
    private handleSubmit = (value: any) => {
        this.state.formRef.current?.validateFields().then((values: any) => {
            this.daemonEdit(this.state.token, this.parseValues(values))
        })
    }

    private parseValues = (values: any) => {
        let newPrams: any = {
            addr: values.addr,
            name: values.name,
            code: values.code,
            failRestart: values.failRestart,
            command: trimEmpty(values.command.split(' '))
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

        if (values.workIp !== undefined) {
            newPrams.workIp = trimEmpty(values.workIp.split(','))
        }

        if (values.workEnv !== undefined) {
            newPrams.workEnv = trimEmpty(values.workEnv.split(','))
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
        if (values.retryNum !== undefined) {
            newPrams.retryNum = values.retryNum
        }

        return newPrams
    }
    private daemonEdit = (jiaToken: string, values: object) => {
        this.setState({
            loading: true
        })
        getRequest({
            url: API.daemonEdit,
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
        const defaultFormValus: any = this.state.defaultObject
        // const { getFieldDecorator } = this.state.form
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
                                route: '/editDaemon'
                            }
                        ]}
                    />
                    <Card size="small" title="??????????????????">
                        <Form 
                            onFinish={this.handleSubmit} 
                            ref={this.state.formRef}
                            initialValues={this.state.initialValues}
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
                                <Input
                                    placeholder="?????????????????????"
                                />
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
                                <Input placeholder="???????????????" />
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
                            <Form.Item {...formItemLayout} label="????????????" name="workDir">
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

                            <Form.Item {...formItemLayout} label="????????????" name="failRestart" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="??????????????????" name="retryNum">
                                <InputNumber
                                    min={0}
                                    placeholder="???????????????????????????"
                                />
                                
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="????????????" name="mailTo">
                                <Input placeholder="?????????????????????" />
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="api??????" name="APITo">
                                <Input placeholder="?????????api??????" />
                            </Form.Item>

                            <Form.Item {...formItemLayout} label="??????webhook??????" name="DingdingTo">
                                <Input placeholder="???????????????webhook????????????????????????????????????,???????????????????????????" />
                            </Form.Item>
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
                                    className="ant-btn-primary"
                                    htmlType="submit"
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

export default EditDaemon
