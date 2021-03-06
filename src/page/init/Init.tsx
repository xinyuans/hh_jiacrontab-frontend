import * as React from 'react'
import './Init.css'
import API from '../../config/api'
import Footers from '../../components/footer'
import { getRequest } from '../../utils/utils'

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';

import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
// import '@ant-design/compatible/assets/index.css';

import { Button, Input, Layout, message } from 'antd';
// import { FormComponentProps } from '@ant-design/compatible/lib/form';
import { setCooket } from 'src/utils/cookie'
const { Content, Footer } = Layout
const FormItem = Form.Item

// function hasErrors(fieldsError: object) {
//     return Object.keys(fieldsError).some(field => fieldsError[field])
// }
interface Props {
    history?: any
}
interface State {
    isMysql: boolean,
    loading: boolean,
    formRef: React.RefObject<FormInstance>
}
class Init extends React.Component<Props,State> {
    public state: State
    constructor(props: Props) {
        super(props)
        this.state = {
            isMysql: false,
            loading: false,
            formRef: React.createRef<FormInstance>()
        }
    }

    // state = {
    //     isMysql: false,
    //     loading: false
    // }

    public componentDidMount() {
        //driverName dsn
        // DSN (Data Source Name)
        //[username[:password]@][protocol[(address)]]/dbname[?param1=value1&...&paramN=valueN]
    }
    private handleSubmit = (e: any) => {
        // e.preventDefault()
        this.state.formRef.current?.validateFields().then(values => {
            // if (!err) {
                this.setState({
                    loading: true
                })
                getRequest({
                    url: API.AppInit,
                    data: {
                        ...values
                    },
                    succ: (data: any) => {
                        this.setState(
                            {
                                loading: false
                            },
                            () => {
                                setCooket('ready', 'true')
                                this.props.history.push('/login')
                                message.success('??????????????????????????????')
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
            // }
        })
    }

    public render() {
        // const getFieldsError  = this.state.formRef.current?.getFieldsError()
        return (
            <Layout className="init-page" style={{ minHeight: '100vh' }}>
                <Content>
                    <div className="login-panel">
                        <Form
                            ref={this.state.formRef}
                            onFinish={this.handleSubmit}
                            style={{
                                background: '#fff',
                                borderRadius: '4px',
                                width: '100%',
                                padding: '20px 40px 40px'
                            }}
                            className="login-form"
                            // initialValues={{ remember: true }}
                        >
                            <div className="login-header">Jiacrontab</div>
                            <div className="login-sub">
                                ????????????????????????????????????
                            </div>
                            <FormItem
                                name="username"
                                rules={[{ required: true, message: '??????????????????' }]}
                            >
                                <Input
                                    prefix={
                                        <UserOutlined
                                            style={{
                                                color: 'rgba(0,0,0,.25)'
                                            }} />
                                    }
                                    placeholder="??????????????????"
                                />
                            </FormItem>
                            <FormItem
                                name="passwd"
                                rules={[{ required: true, message: '???????????????' }]}

                            >
                                
                                    <Input
                                        prefix={
                                            <LockOutlined
                                                style={{
                                                    color: 'rgba(0,0,0,.25)'
                                                }} />
                                        }
                                        type="password"
                                        placeholder="???????????????"
                                    />
                            </FormItem>
                            <FormItem
                                name="mail"
                                rules={[
                                    {
                                      type: 'email',
                                      message: '????????????????????????',
                                    },
                                    {
                                      required: true,
                                      message: '?????????????????????',
                                    },
                                  ]}

                            >
                                <Input
                                    // name="mail"
                                    prefix={
                                        <MailOutlined
                                            style={{
                                                color: 'rgba(0,0,0,.25)'
                                            }} />
                                    }
                                    type="email"
                                    placeholder="???????????????"
                                />
                            </FormItem>

                            <FormItem>
                                <Button
                                    htmlType="submit"
                                    type="primary"
                                    loading={false}
                                    block
                                    size='large'
                                    // disabled={hasErrors(getFieldsError}
                                >
                                    ???????????????
                                </Button>
                            </FormItem>
                        </Form>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    <Footers />
                </Footer>
            </Layout>
        );
    }
}

export default Init
