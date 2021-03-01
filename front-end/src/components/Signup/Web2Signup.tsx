// Copyright 2019-2020 @paritytech/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styled from '@xstyled/styled-components';
import React, { useContext } from 'react';
import { FieldError,useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Divider } from 'semantic-ui-react';

import { ModalContext } from '../../context/ModalContext';
import { UserDetailsContext } from '../../context/UserDetailsContext';
import { useSignupMutation } from '../../generated/graphql';
import { useRouter } from '../../hooks';
import { handleTokenChange } from '../../services/auth.service';
import Button from '../../ui-components/Button';
import FilteredError from '../../ui-components/FilteredError';
import { Form } from '../../ui-components/Form';
import HelperTooltip from '../../ui-components/HelperTooltip';
import messages from '../../util/messages';
import * as validation from '../../util/validation';

interface Props {
	className?: string
	toggleWeb2Signup: () => void
}

const SignupForm = ({ className, toggleWeb2Signup }:Props): JSX.Element => {
	const { history } = useRouter();
	const currentUser = useContext(UserDetailsContext);
	const [signupMutation, { loading, error }] = useSignupMutation();
	const { errors, handleSubmit, register } = useForm();

	const { setModal } = useContext(ModalContext);

	const handleSubmitForm = (data:Record<string, any>):void => {
		const { email, password, username } = data;

		if (username && password){
			signupMutation({
				variables: {
					email,
					password,
					username
				}
			})
				.then(({ data }) => {
					if (data && data.signup && data.signup.token) {
						handleTokenChange(data.signup.token, currentUser);
						if (email) {
							setModal({ content: 'We sent you an email to verify your address. Click on the link in the email.', title: 'You\'ve got some mail' });
						}
						history.goBack();
					}}

				).catch((e) => {
					console.error('Login error', e);
				});
		}
	};

	const handleToggle = () => toggleWeb2Signup();

	return (
		<Form className={className} onSubmit={handleSubmit(handleSubmitForm)}>
			<h3>Sign Up</h3>
			<Form.Group>
				<Form.Field width={16}>
					<label>Username<sup>*</sup></label>
					<input
						className={errors.username ? 'error' : ''}
						name='username'
						placeholder='john'
						ref={register(validation.username)}
						type='text'
					/>
					{(errors.username as FieldError)?.type === 'maxLength' && <span className={'errorText'}>{messages.VALIDATION_USERNAME_MAXLENGTH_ERROR}</span>}
					{(errors.username as FieldError)?.type === 'minLength' && <span className={'errorText'}>{messages.VALIDATION_USERNAME_MINLENGTH_ERROR}</span>}
					{(errors.username as FieldError)?.type === 'pattern' && <span className={'errorText'}>{messages.VALIDATION_USERNAME_PATTERN_ERROR}</span>}
					{(errors.username as FieldError)?.type === 'required' && <span className={'errorText'}>{messages.VALIDATION_USERNAME_REQUIRED_ERROR}</span>}
				</Form.Field>
			</Form.Group>
			<Form.Group>
				<Form.Field width={16}>
					<label>
						Email
						<HelperTooltip
							content='Your email is used for password recovery or discussion notifications.'
						/>
					</label>
					<input
						className={errors.email ? 'error' : ''}
						name='email'
						placeholder='john@doe.com'
						ref={register(validation.email)}
						type='text'
					/>
					{errors.email && <span className={'errorText'}>{messages.VALIDATION_EMAIL_ERROR}</span>}
				</Form.Field>
			</Form.Group>
			<Form.Group>
				<Form.Field width={16}>
					<label>Password<sup>*</sup></label>
					<input
						className={errors.password ? 'error' : ''}
						name='password'
						placeholder='Password'
						ref={register(validation.password)}
						type='password'
					/>
					{errors.password && <span className={'errorText'}>{messages.VALIDATION_PASSWORD_ERROR}</span>}
				</Form.Field>
			</Form.Group >
			<Form.Field>
				<label className='checkbox-label'>
					<input
						className={errors.termsandconditions ? 'error' : ''}
						name='termsandconditions'
						value='yes'
						ref={register({ required: true })}
						type='checkbox'
					/>
					I have read and agree to the terms of the <Link to='/terms-and-conditions'>Polkassembly end user agreement</Link>.
				</label>
				{errors.termsandconditions && <div className={'errorText'}>Please agree to the terms of the Polkassembly end user agreement.</div>}
			</Form.Field>
			<div className='text-muted'>To see how we use your personal data please see our <Link to='/privacy'>privacy notice</Link>.</div>
			<div className={'mainButtonContainer'}>
				<Button
					primary
					disabled={loading}
					onClick={handleSubmitForm}
					type="submit"
				>
					Sign-up
				</Button>
				{error?.message && <FilteredError text={error.message}/>}
			</div>
			<Divider horizontal>Or</Divider>
			<div className={'mainButtonContainer'}>
				<Button
					secondary
					disabled={loading}
					onClick={handleToggle}
				>
					Sign-up with Web3 address
				</Button>
			</div>
		</Form>
	);
};

export default styled(SignupForm)`

	.mainButtonContainer{
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-top: 3rem;
	}

	input.error {
		border-color: red_secondary !important;
	}

	.errorText {
		color: red_secondary;
	}

	.checkbox-label {
		position: relative;
		bottom: 0.1rem;
		display: inline-block !important;
		font-size: sm !important;
		font-weight: 400 !important;
		color: grey_primary !important;
		a {
			color: grey_primary;
			border-bottom-style: solid;
			border-bottom-width: 1px;
			border-bottom-color: grey_primary;
		}
	}
`;
