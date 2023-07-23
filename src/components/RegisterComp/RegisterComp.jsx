import React, { useState } from 'react';
import { styled } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { addUsers, getUsers } from '../../api/users';
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai';

const RegisterComp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pwCheck, setPwCheck] = useState('');

  const [nameMessage, setNameMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwCheckMessage, setPwCheckMessage] = useState('');
  const [isName, setIsName] = useState(false);
  const [isEmail, setIsEmail] = useState(false);
  const [isPw, setIsPw] = useState(false);
  const [isPwCheck, setIsPwCheck] = useState(false);

  const [isShowPw, setIsShowPw] = useState(false);
  const [isShowPwCheck, setIsShowPwCheck] = useState(false);

  const queryClient = useQueryClient();
  const mutation = useMutation(addUsers, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      // console.log('신규 회원 가입 & 데이터 최신화 성공!!!');
    },
    onError: () => {
      alert('죄송합니다. 현재 서버가 불안정한 상태입니다. 최대한 빠르게 복구하겠습니다.');
    }
  });

  const toggleShowPw = () => {
    setIsShowPw(!isShowPw);
  };
  const toggleShowPwCheck = () => {
    setIsShowPwCheck(!isShowPwCheck);
  };

  // db.json에서 users collection Get
  const { data, isLoading, isError } = useQuery('users', getUsers);
  if (isLoading) {
    console.log('users 컬렉션 loading중');
  }
  if (isError) {
    alert('닉네임 중복검사 데이터get 에러');
    return false;
  }
  const nameUsing = data?.map((item) => item.name);
  const emailUsing = data?.map((item) => item.email);

  const HandleInputChange = (event, setState, setStateMessage) => {
    setStateMessage('');
    setState(event.target.value);
  };

  // 회원정보 입력시 유효성 검사에 따라 메시지 출력
  const HandleInputValidation = (event) => {
    event.preventDefault();
    const currentName = event.target.name;
    const currentValue = event.target.value;
    switch (currentName) {
      case 'name':
        const nameRegExp = /^[가-힣a-zA-Z0-9][가-힣a-zA-Z0-9]{1,9}$/;
        if (currentValue === '') {
          setNameMessage('');
        } else if (!nameRegExp.test(currentValue)) {
          setNameMessage(`*한글·영문 대소문자 또는 숫자만 입력해주세요!`);
          setIsName(false);
        } else if (nameUsing.includes(currentValue)) {
          setNameMessage('*누군가 이 닉네임을 사용중입니다!');
          setIsName(false);
        } else {
          setNameMessage('*사용가능한 닉네임입니다.');
          setIsName(true);
        }
        break;

      case 'email':
        const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (currentValue === '') {
          setNameMessage('');
        } else if (!emailRegExp.test(currentValue)) {
          setEmailMessage('*올바른 이메일 형식이 아닙니다.');
          setIsEmail(false);
        } else if (emailUsing.includes(currentValue)) {
          setEmailMessage('*누군가 이 이메일을 사용중입니다!');
          setIsEmail(false);
        } else {
          setEmailMessage('*사용가능한 이메일입니다.');
          setIsEmail(true);
        }
        break;

      case 'pw':
        const pwRegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
        if (currentValue === '') {
          setNameMessage('');
        } else if (!pwRegExp.test(currentValue)) {
          setPwMessage('*비밀번호는 문자, 숫자, 특수문자 포함 8자 이상입니다!');
          setIsPw(false);
        } else {
          setPwMessage('*사용가능한 비밀번호입니다!');
          setIsPw(true);
        }
        break;

      case 'pwCheck':
        if (currentValue === '') {
          setNameMessage('');
        } else if (!(currentValue == pw)) {
          setPwCheckMessage('*확인 비밀번호가 일치하지 않습니다');
          setIsPwCheck(false);
        } else {
          setPwCheckMessage('*확인 비밀번호가 일치합니다!');
          setIsPwCheck(true);
        }
        break;

      default:
        break;
    }
  };

  // 회원등록 버튼 클릭시 유효성 검사
  const HandleRegisterSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isPwCheck === false) {
        alert('확인 비밀번호가 일치하지 않습니다!');
        return false;
      } else if ((isName || isEmail || isPw || isPwCheck) === false) {
        alert('입력정보를 다시 확인해 주세요!');
        return false;
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pw);

        // 회원가입 => 자동 로그인(미리 토큰을 받아 세션스토리지에 저장)
        const user = userCredential.user;
        const token = await user.getIdToken();
        sessionStorage.setItem('token', token);

        const newUser = {
          id: auth.currentUser.uid ? auth.currentUser.uid : '작성자 uid 오류',
          name,
          email,
          pw
        };
        mutation.mutate(newUser);
        alert('회원가입을 완료했습니다.');
        navigate('/');
        window.location.reload();
      }
    } catch (error) {
      alert('회원가입 파이어베이스 오류');
      return false;
    }
  };

  return (
    <StRegisterSection>
      <StRegisterForm onSubmit={HandleRegisterSubmit}>
        <StRegisterInputBox>
          <label>닉네임</label>
          <br />
          <StRegisterInput
            name="name"
            type="text"
            placeholder="2글자~10글자 닉네임"
            value={name}
            onChange={(event) => HandleInputChange(event, setName, setNameMessage)}
            onBlur={(event) => HandleInputValidation(event)}
          />
          <br />
          <StRegisterMsg className="message"> {nameMessage} </StRegisterMsg>
        </StRegisterInputBox>
        <StRegisterInputBox>
          <label>이메일</label>
          <br />
          <StRegisterInput
            name="email"
            type="text"
            placeholder="ex: healthZZang@reactprotain.com"
            value={email}
            onChange={(event) => HandleInputChange(event, setEmail, setEmailMessage)}
            onBlur={(event) => HandleInputValidation(event)}
          />
          <br />
          <StRegisterMsg className="message"> {emailMessage} </StRegisterMsg>
        </StRegisterInputBox>
        <StRegisterInputBox>
          <label>비밀번호</label>
          <StPwBox>
          <br />
          <StRegisterInput
            name="pw"
            type={isShowPw ? 'text' : 'password'}
            placeholder="영문 대소문자, 숫자, 특수문자 포함 8자 이상"
            value={pw}
            onChange={(event) => HandleInputChange(event, setPw, setPwMessage)}
            onBlur={(event) => HandleInputValidation(event)}
          />
          <br />
          <div>{isShowPw ? <AiFillEyeInvisible className="eyeIcon" onClick={toggleShowPw} /> : <AiFillEye className="eyeIcon" onClick={toggleShowPw} />}</div>
          </StPwBox>
          <StRegisterMsg className="message"> {pwMessage} </StRegisterMsg>
        </StRegisterInputBox>
        <StRegisterInputBox>
          <label>비밀번호 확인</label>
          <br />
          <StPwBox>
            <StRegisterInput
              name="pwCheck"
              type={isShowPwCheck ? 'text' : 'password'}
              placeholder="비밀번호와 동일하게 적어주세요!"
              value={pwCheck}
              onChange={(event) => HandleInputChange(event, setPwCheck, setPwCheckMessage)}
              onBlur={(event) => HandleInputValidation(event)}
            />
            <div>{isShowPwCheck ? <AiFillEyeInvisible className="eyeIcon" onClick={toggleShowPwCheck} /> : <AiFillEye className="eyeIcon" onClick={toggleShowPwCheck} />}</div>
            <br />
          </StPwBox>
          <StRegisterMsg className="message"> {pwCheckMessage} </StRegisterMsg>
        </StRegisterInputBox>
        <StRegisterBtn>회원가입</StRegisterBtn>
        <StGoLoginSpan onClick={() => navigate('/login')}>로그인 페이지 이동</StGoLoginSpan>
      </StRegisterForm>
    </StRegisterSection>
  );
};

export default RegisterComp;

const StRegisterSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  margin: auto;
`;

const StRegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 500px;
  min-height: 700px;
  width: 20%;
  height: 50%;
  border: 5px solid #ff6e6e;
  border-radius: 10%;
  box-shadow: rgb(255, 110, 110) 20px 30px 30px -10px;
  margin: auto;
  gap: 1.5rem;

  .eyeIcon {
    font-size: 1.5rem;
  }
`;

const StPwBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StRegisterInputBox = styled.div`
  display: block;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StRegisterInput = styled.input`
  width: 15rem;
  height: 1rem;
  font-size: 16px;
  padding: 0.5rem;
  min-width: 20rem;
  margin: 5px 0;
  outline: none;
  border: none;
  border-bottom: 2px solid black;
  transition-duration: 0.2s;
  &:focus {
    border-bottom: 2px solid #ff6e6e;;
  }
`;

const StRegisterBtn = styled.button`
  margin-top: 0.5rem;
  height: 2.5rem;
  width: 23rem;
  font-size: 20px;
  background-color: white;
  color: #ff6e6e;
  font-weight: bold;
  border: 1px solid #ff6e6e;
  cursor: pointer;
  &:hover {
    transition-duration: 0.5s;
    background-color: #ff6e6e;
    color: white;
    font-weight: bold;
  }
`;

const StRegisterMsg = styled.p`
  font-size: 13px;
  color: #ff6e6e;
  min-height: 1rem;
  height: 1rem;
  min-width: 20rem;
  width: 22rem;
  white-space: pre-wrap;
`;

const StGoLoginSpan = styled.span`
  margin-top: 3rem;
  text-align: center;
  width: 20rem;
  height: 2rem;
  cursor: pointer;
  &:hover {
    transition-duration: 0.2s;
    color: #ff6e6e;
    text-decoration: underline;
    font-weight: bold;
  }
`;


