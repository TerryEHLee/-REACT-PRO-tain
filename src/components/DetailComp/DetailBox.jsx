import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getComments, addComment, deleteComment } from '../../api/comments';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { auth } from '../../firebase';
import DetailUpdate from './DetailUpdate';
import { VscTriangleDown } from 'react-icons/vsc';
import { MdOutlineMapsHomeWork, MdOutlinePhonelinkRing } from 'react-icons/md';
import { getUsers } from '../../api/users';
import DetailInput from './DetailInput';
import {
  StDetailPage,
  StDetailBox,
  StReviewCountBox,
  StCommentBox,
  StCommentHeader,
  StCommentBtnCtn,
  StCommentButtons,
  StModalBox,
  StModalCtn,
  StCloseModalBtn,
  StDetailTitle,
  StReviewInfo,
  StReviewInfo2,
  StModalBtnCtn,
  StReviewInfoModal,
  StReviewInfoWtModal
} from './DetailStyles';

const DetailBox = ({ placeData }) => {
  const params = useParams();

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [displayedComments, setDisplayedComments] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => {
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
  };

  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);

  // Function to open the new review modal
  const openNewReviewModal = () => {
    setIsNewReviewModalOpen(true);
  };

  // Function to close the new review modal
  const closeNewReviewModal = () => {
    setIsNewReviewModalOpen(false);
  };

  const handleReviewButtonClick = () => {
    openNewReviewModal();
  };

  const [authLoading, setAuthLoading] = useState(true);
  // 로그인한 사용자 정보를 관리하는 상태 변수
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // onAuthStateChanged 메서드로 사용자 정보를 받아옴
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false); // 사용자 정보를 받아오는 것이 완료됨을 표시
    });

    // 컴포넌트가 unmount 될 때 리스너를 정리
    return () => unsubscribe();
  }, []);

  const { data } = useQuery('comments', getComments, {
    onSuccess: (data) => {
      setDisplayedComments(data.filter((comment) => comment.shopId === shopId));
    }
  });

  const { data: userData } = useQuery('users', getUsers, {
    onSuccess: (userData) => {}
  });
  const shopId = params.id;

  //가격정보 select창 관련
  const currentPlace = placeData.category_name.split('>').pop().trim();
  const [isActive, setIsActive] = useState(false);
  const [selected, setSelected] = useState('');
  const showDropdown = () => {
    setIsActive(!isActive);
  };
  const [price, setPrice] = useState('');
  const options = (() => {
    if (currentPlace.includes('헬스')) {
      return [
        '헬스이용권 1개월',
        '헬스이용권 3개월',
        '헬스이용권 6개월',
        '헬스이용권 12개월',
        'PT 10회',
        'PT 20회',
        'PT 30회'
      ];
    } else if (currentPlace.includes('필라테스')) {
      return [
        '필라테스 회원권 1개월',
        '필라테스 회원권 3개월',
        '필라테스 회원권 6개월',
        '필라테스 회원권 12개월',
        'PT 10회',
        'PT 20회',
        'PT 30회',
        '그룹레슨'
      ];
    } else if (currentPlace.includes('요가')) {
      return [
        '요가 회원권 1개월',
        '요가 회원권 6개월',
        '요가 회원권 9개월',
        '요가 회원권 12개월',
        'PT 10회',
        'PT 20회',
        'PT 30회',
        '그룹레슨'
      ];
    } else if (currentPlace.includes('협회') || currentPlace.includes('댄스')) {
      return [
        '댄스 회원권 1개월',
        '댄스 회원권 6개월',
        '댄스 회원권 9개월',
        '댄스 회원권 12개월',
        'PT 10회',
        'PT 20회',
        'PT 30회',
        '그룹레슨'
      ];
    } else {
      return ['죄송합니다. 아직 해당 기관 정보를 받지 못했습니다.'];
    }
  })();

  const addComma = (value) => {
    // 입력된 값에서 숫자 이외의 문자를 모두 제거
    const numericValue = value.replace(/[^\d]/g, '');
    // 콤마 추가한 문자열 생성
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedValue;
  };
  const handleChange = (event) => {
    // 1000단위마다 콤마를 추가하여 설정
    setPrice(addComma(event.target.value));
  };
  //가격정보 select창 관련

  //별점 구하는 곳
  const reviews = data?.filter((item) => item.shopId === shopId);
  const commentRatingArr = reviews?.map((item) => item.rating);
  const commentRatingSum = commentRatingArr?.reduce((acc, cur) => acc + cur, 0);
  // 리뷰 개수
  const commentRatingLength = commentRatingArr?.length;
  // 총 별점 평균
  const RatingAvg = (commentRatingSum / commentRatingLength).toFixed(2);

  const queryClient = useQueryClient();

  const mutation = useMutation(addComment, {
    onSuccess: () => {
      queryClient.invalidateQueries('comments');
    }
  });

  const deleteMutation = useMutation(deleteComment, {
    onSuccess: () => {
      queryClient.invalidateQueries('comments');
    }
  });

  const addCommentHandler = async () => {
    if (!comment || rating === 0 || !selected || !price) {
      alert('모든 항목을 입력하세요');
      return;
    }

    const newComment = {
      shopId,
      comment,
      rating,
      userId: auth.currentUser.uid,
      selected,
      price,
      createdAt: new Date().toISOString()
    };

    mutation.mutate(newComment);
    setComment('');
    setRating(0);
    setSelected('');
    setPrice('');
    closeNewReviewModal();
  };

  const deleteCommentHandler = (id) => {
    const confirmed = window.confirm('이 댓글을 삭제하시겠습니까?');
    if (confirmed) {
      deleteMutation.mutate(id);
      setDisplayedComments((prevComments) => prevComments.filter((comment) => comment.id !== id));
    }
  };

  const commentHandler = (event) => {
    setComment(event.target.value);
  };

  const handleRatingSelection = (ratingValue) => {
    setRating(ratingValue);
  };

  const getUserName = (userId) => {
    const user = userData?.find((user) => user.id === userId);
    return user?.name || 'Unknown User'; // Return 'Unknown User' if user is not found
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('ko-KR', options);
  };

  // 사용자 정보 로딩 중이면 로딩 스피너 또는 로딩 메시지를 보여줄 수도 있음
  if (authLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <StDetailPage style={{ marginTop: '100px' }}>
        <StDetailBox size="placeTitle">
          <StDetailTitle>{placeData?.place_name}</StDetailTitle>
          <StReviewCountBox>
            <StReviewInfo>⭐ {isNaN(RatingAvg) ? '0.00' : RatingAvg}</StReviewInfo>
            <StReviewInfo>방문자 리뷰: {commentRatingLength}</StReviewInfo>
          </StReviewCountBox>
        </StDetailBox>
        <StDetailBox size="placeDetail">
          <StReviewInfo>
            <MdOutlineMapsHomeWork /> {placeData?.road_address_name}
          </StReviewInfo>
          <StReviewInfo>
            <MdOutlinePhonelinkRing />
            {placeData?.phone ? placeData?.phone : '사장님 전화번호 넣어주세요!!'}
          </StReviewInfo>
        </StDetailBox>
        <StDetailBox display="block" size="placeReviews">
          <br />
          {data
            ?.filter((comment) => comment.shopId === shopId)
            .map((comment) => {
              const formattedDate = formatDate(comment.createdAt);
              return (
                <StCommentBox key={comment.id}>
                  <StCommentHeader>
                    <StReviewInfo2>
                      {getUserName(comment.userId)}&nbsp;&nbsp;&nbsp; 리뷰별점 : {comment.rating.toFixed(1)}
                    </StReviewInfo2>
                    <StReviewInfo2>
                      작성일 : {formattedDate !== 'Invalid Date' ? formattedDate : 'No Date'}
                    </StReviewInfo2>
                  </StCommentHeader>
                  <StReviewInfo2>회원권 : {comment.selected}</StReviewInfo2>
                  <StReviewInfo2>가격 : ₩ {comment.price}</StReviewInfo2>
                  <StReviewInfo2>리뷰 내용 : {comment.comment}</StReviewInfo2>
                  {auth.currentUser.uid != null && comment.userId === auth.currentUser.uid && (
                    <StCommentBtnCtn>
                      <StCommentButtons onClick={openModal}>수정</StCommentButtons>
                      <StCommentButtons
                        onClick={() => {
                          deleteCommentHandler(comment.id);
                        }}
                      >
                        삭제
                      </StCommentButtons>
                    </StCommentBtnCtn>
                  )}

                  {isOpen && (
                    <StModalBox onClick={closeModal}>
                      <StModalCtn onClick={(event) => event.stopPropagation()}>
                        <StModalBtnCtn>
                          <StReviewInfoModal>리뷰를 수정해주세요!!</StReviewInfoModal>
                          <StCloseModalBtn onClick={closeModal}>X</StCloseModalBtn>
                        </StModalBtnCtn>
                        <DetailUpdate item={comment ? comment : null} placeData={placeData} closeModal={closeModal} />
                      </StModalCtn>
                    </StModalBox>
                  )}
                </StCommentBox>
              );
            })}
        </StDetailBox>
        <StDetailBox size="placeDetail">
          <StReviewInfo onClick={handleReviewButtonClick} style={{ width: '460px', cursor: 'pointer' }}>
            리뷰를 남겨보세요
          </StReviewInfo>
          {isNewReviewModalOpen && (
            <StModalBox onClick={closeNewReviewModal}>
              <StModalCtn onClick={(event) => event.stopPropagation()}>
                <StModalBtnCtn>
                  <StReviewInfoWtModal>리뷰를 작성해주세요!!</StReviewInfoWtModal>
                  <StCloseModalBtn onClick={closeNewReviewModal}>X</StCloseModalBtn>
                </StModalBtnCtn>
                <DetailInput
                  rating={rating}
                  handleRatingSelection={handleRatingSelection}
                  selected={selected}
                  showDropdown={showDropdown}
                  isActive={isActive}
                  options={options}
                  setSelected={setSelected}
                  setIsActive={setIsActive}
                  price={price}
                  handleChange={handleChange}
                  comment={comment}
                  commentHandler={commentHandler}
                  addCommentHandler={addCommentHandler}
                />
              </StModalCtn>
            </StModalBox>
          )}
        </StDetailBox>
      </StDetailPage>
    </>
  );
};

export default DetailBox;
