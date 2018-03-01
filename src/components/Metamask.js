import React from 'react';
import logo from '../assets/logo/logo.svg';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Alert from 'antd/lib/alert';
import Layout, { Header, Content, Footer } from 'antd/lib/layout';

const Metamask = () => {
	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Header style={{ background: 'rgb(35, 13, 58)' }}>
				<div className="logo">
					<img src={logo} alt="SingularityNET" />
				</div>
			</Header>
			<Content>
				<Row type="flex" justify="center">
					<Col span={15} style={{ marginTop: '40px' }}>
						<Alert
							message="Unlock Metamask and select the Kovan testnet"
							type="info"
						/>
					</Col>
				</Row>
			</Content>
			<Footer style={{ textAlign: 'center' }}>SingularityNET</Footer>
		</Layout>
	);
};

export default Metamask;
