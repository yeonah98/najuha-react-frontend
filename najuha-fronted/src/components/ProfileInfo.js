import React from 'react'
import { useState, useEffect } from 'react'
import './profileInfo.css'
import axios from 'axios'
import { Cookies } from 'react-cookie'
import { useJwt } from 'react-jwt'
import { useNavigate, useParams } from 'react-router-dom'
import arrowLeftIcon from '../src_assets/arrow_left.svg'
import samplePoster from '../src_assets/samplePoster.png'

// 결제에 필요한
import Paymentmodal from './Paymentmodal'
import { loadTossPayments } from '@tosspayments/payment-sdk'

function ProfileInfo() {
  const [rawCompetitionApplicationInfo, setRawCompetitionApplicationInfo] =
    useState({})
  const [competitionApplicationInfo, setcompetitionApplicationInfo] = useState(
    []
  ) //유저 신청 대회 상세정보 가져오기
  const [competitionApplicationList, setCompetitionApplicationList] = useState(
    []
  ) //유저 신청 대회 유저 리스트 가져오기
  const cookies = new Cookies()
  const xAccessToken = cookies.get('x-access-token')
  const { decodedToken, isExpired } = useJwt(xAccessToken)
  const navigate = useNavigate()

  // 결제에 필요한 state값
  const [paymentmodal, setPaymentmodal] = useState(false)
  const [paymentmethod, setPaymentmethod] = useState(null)
  const [easypaymethod, setEasypaymethod] = useState(null)
  const frontBaseUrl = 'http://localhost:3001'

  const competitionApplicationId = useParams().id // ex) id: 1
  console.log('대회 id: ' + competitionApplicationId)
  const cursorStyle = { cursor: 'default' }

  // 토스결제에 필요한 데이터 post
  const postPaymentData = async () => {
    const xAccessToken = cookies.get('x-access-token')
    const paymentData = await axios({
      method: 'post',
      url: `${process.env.REACT_APP_BACK_END_API}/competitionApplications/${competitionApplicationId}/payments`,
      headers: {
        'x-access-token': xAccessToken,
      },
    })
    console.log(paymentData)
    return paymentData
  }
  // 토스결제
  const tossPay = async () => {
    const clientkey = process.env.REACT_APP_TOSS_CLIENTKEY
    const res = await postPaymentData()
    const data = res.data.result
    if (paymentmethod == '카드') {
      loadTossPayments(clientkey).then(tossPayments => {
        tossPayments.requestPayment('카드', {
          amount: data.amount,
          orderId: data.orderId,
          orderName: data.orderName,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          successUrl: frontBaseUrl + '/toss/success',
          failUrl: frontBaseUrl + '/toss/fail',
        })
      })
    } else if (paymentmethod == '간편결제') {
      loadTossPayments(clientkey).then(tossPayments => {
        tossPayments.requestPayment('카드', {
          amount: data.amount,
          orderId: data.orderId,
          orderName: data.orderName,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          successUrl: frontBaseUrl + '/toss/success',
          failUrl: frontBaseUrl + '/toss/fail',
          flowMode: 'DIRECT',
          easyPay: easypaymethod,
        })
      })
    } else if (paymentmethod == '계좌이체') {
      loadTossPayments(clientkey).then(tossPayments => {
        tossPayments.requestPayment('계좌이체', {
          amount: data.amount,
          orderId: data.orderId,
          orderName: data.orderName,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          successUrl: frontBaseUrl + '/toss/success',
          failUrl: frontBaseUrl + '/toss/fail',
        })
      })
    }
  }

  //서버에서 신청상세정보 가져오기
  async function getCompetitionApplicationInfo() {
    axios
      .get(
        `${process.env.REACT_APP_BACK_END_API}/users/competitionApplications/${competitionApplicationId}`,
        {
          headers: {
            'x-access-token': xAccessToken,
          },
        }
      )
      .then(res => {
        setRawCompetitionApplicationInfo(res.data.result)
        setcompetitionApplicationInfo(applicationParsing(res.data.result))
        setCompetitionApplicationList(
          res.data.result.CompetitionApplicationInfos
        )
        console.log(res.data.result)
        console.log(res.data.message)
      })
      .catch(err => {
        console.log(err)
        console.log(err.response.status)
        console.log(err.response.data.message)
      })
    return
  }

  //요일 값 구하기
  function getDayOfWeek(날짜문자열) {
    //ex) getDayOfWeek('2022-06-13')

    const week = ['일', '월', '화', '수', '목', '금', '토']

    const dayOfWeek = week[new Date(날짜문자열).getDay()]

    return dayOfWeek
  }

  //핸드폰 숫자 사이 하이픈 넣기
  function autoHypenPhone(str) {
    let tmp = ''
    if (str.length < 4) {
      return str
    } else if (str.length < 7) {
      tmp += str.substr(0, 3)
      tmp += '-'
      tmp += str.substr(3)
      return tmp
    } else if (str.length < 11) {
      tmp += str.substr(0, 3)
      tmp += '-'
      tmp += str.substr(3, 3)
      tmp += '-'
      tmp += str.substr(6)
      return tmp
    } else {
      tmp += str.substr(0, 3)
      tmp += '-'
      tmp += str.substr(3, 4)
      tmp += '-'
      tmp += str.substr(7)
      return tmp
    }

    return str
  }

  //신청대회 데이터 파싱
  function applicationParsing(application) {
    let today = new Date()
    let id = application.id
    let competitionId = application.Competition.id
    let title = application.Competition.title

    let postUrl = application.Competition.CompetitionPoster
      ? application.Competition.CompetitionPoster.imageUrl
      : samplePoster
    let doreOpen = application.Competition.doreOpen
      .substr(0, 10)
      .replace('-', '.')
      .replace('-', '.')
    let doreOpenDay = getDayOfWeek(application.Competition.doreOpen)
    let location = application.Competition.location
    let earlyBirdDeadline = application.Competition.earlyBirdDeadline
      .substr(0, 10)
      .replace('-', '.')
      .replace('-', '.')
    let earlyBirdDeadlineDay = getDayOfWeek(
      application.Competition.earlyBirdDeadline
    )
    let registrationDeadline = application.Competition.registrationDeadline
      .substr(0, 10)
      .replace('-', '.')
      .replace('-', '.')
    let registrationDeadlineDay = getDayOfWeek(
      application.Competition.registrationDeadline
    )
    let applicantTableOpenDate = application.Competition.applicantTableOpenDate
      .substr(0, 10)
      .replace('-', '.')
      .replace('-', '.')
    let applicantTableOpenDateDay = getDayOfWeek(
      application.Competition.applicantTableOpenDate
    )
    let tournamentTableOpenDate =
      application.Competition.tournamentTableOpenDate
        .substr(0, 10)
        .replace('-', '.')
        .replace('-', '.')
    let tournamentTableOpenDateDay = getDayOfWeek(
      application.Competition.tournamentTableOpenDate
    )
    let team = application.CompetitionApplicationInfos[0].team
    let phoneNumber = autoHypenPhone(
      application.CompetitionApplicationInfos[0].phoneNumber
    )
    let isGroup = application.isGroup ? '단체' : '개인'
    let amount =
      today > new Date(application.Competition.earlyBirdDeadline)
        ? application.expectedPrice.earlyBirdFalse
        : application.expectedPrice.earlyBirdTrue
    let isPay =
      application.competitionPayment === null ? '예상 결제금액' : '총 결제금액'

    //버튼 렌더에 필요한 정보
    let competitionPayment = application.competitionPayment
    let status = application.competitionPayment
      ? application.competitionPayment.status
      : ' '
    let CheckRegistrationDeadline =
      today > new Date(application.Competition.registrationDeadline)
        ? false
        : true //false면 신청마감
    let CheckDoreOpen =
      today > new Date(application.Competition.doreOpen) ? false : true //false면 대회날짜 지남

    return {
      id: id,
      competitionId: competitionId,
      title: title,

      postUrl: postUrl,
      doreOpen: doreOpen + '(' + doreOpenDay + ')',
      location: location,
      earlyBirdDeadline: earlyBirdDeadline + '(' + earlyBirdDeadlineDay + ')',
      registrationDeadline:
        registrationDeadline + '(' + registrationDeadlineDay + ')',
      applicantTableOpenDate:
        applicantTableOpenDate + '(' + applicantTableOpenDateDay + ')',
      tournamentTableOpenDate:
        tournamentTableOpenDate + '(' + tournamentTableOpenDateDay + ')',
      team: team,
      phoneNumber: phoneNumber,
      isGroup: isGroup,
      amount: amount,
      isPay: isPay,

      //버튼 렌더에 필요한 정보
      competitionPayment: competitionPayment,
      status: status,
      CheckRegistrationDeadline: CheckRegistrationDeadline,
      CheckDoreOpen: CheckDoreOpen,
    }
  }

  // 신청 대회 지우기(결제 미완료)
  async function deleteCompetitionApplication(id) {
    axios
      .delete(
        `${process.env.REACT_APP_BACK_END_API}/users/competitionApplications/${id}`,
        {
          headers: {
            'x-access-token': xAccessToken,
          },
        }
      )
      .then(res => {
        console.log('지울 대회 id: ' + id)
        console.log(res.data.message)
        alert('대회가 삭제되었습니다.')
        navigate('/Profilepage')
      })
      .catch(err => {
        console.log(err)
        console.log(err.response.data.result)
        alert(err.response.data.result)
      })
    return
  }

  //삭제 경고 문구창
  const onRemove = id => {
    if (
      window.confirm(
        '대회 정보가 모두 삭제됩니다. 해당 대회를 정말 삭제하시겠습니까?'
      )
    ) {
      deleteCompetitionApplication(id)
    } else {
      //   alert("취소합니다.");
    }
  }

  //수정하기 버튼에 넘겨줄 대회ID, 신청정보ID
  const patchClick = () => {
    //개인으로 신청한 경우
    if (competitionApplicationInfo.isGroup === '개인') {
      navigate(
        `/competition/apply/patch/${competitionApplicationInfo.competitionId}`,
        { state: competitionApplicationInfo.id }
      )
    }
    //단체로 신청한 경우
    if (competitionApplicationInfo.isGroup === '단체') {
      navigate(
        `/competition/applyteam/patch/${competitionApplicationInfo.competitionId}`,
        { state: competitionApplicationInfo.id }
      )
    }
  }

  //버튼 렌더
  function renderButton(application) {
    //competitionPayment이 null이 아니면
    if (application.competitionPayment !== null) {
      //대회날짜 지났으면
      if (application.CheckDoreOpen === false) {
        return (
          //결제완료 버튼
          <div className="CompetitionApplyTeamForm-bottom-table-buttons">
            <button
              id="CompetitionApplyTeamForm-bottom-table-buttons-save"
              style={cursorStyle}>
              결제완료
            </button>
          </div>
        )
      }
      //결제완료(대회날짜 안지남)
      if (application.status === 'APPROVED') {
        return (
          //환불하기&결제완료 버튼
          <div className="CompetitionApplyTeamForm-bottom-table-buttons">
            <button
              id="CompetitionApplyTeamForm-bottom-table-buttons-save"
              onClick={() => alert('고객센터(1234-1234)로 문의바랍니다.')}>
              환불하기
            </button>
            <button
              id="CompetitionApplyTeamForm-bottom-table-buttons-save"
              style={cursorStyle}>
              결제완료
            </button>
          </div>
        )
      }
      //환불완료
      if (application.status === 'CANCELED') {
        return (
          //환불완료 버튼
          <div className="CompetitionApplyTeamForm-bottom-table-buttons">
            <button
              id="CompetitionApplyTeamForm-bottom-table-buttons-save"
              style={cursorStyle}>
              환불완료
            </button>
          </div>
        )
      }
    }

    //신청마감
    if (application.CheckRegistrationDeadline === false) {
      return (
        //삭제하기 버튼
        <div className="CompetitionApplyTeamForm-bottom-table-buttons">
          <button
            id="CompetitionApplyTeamForm-bottom-table-buttons-save"
            onClick={() => {
              onRemove(application.id)
            }}>
            삭제하기
          </button>
        </div>
      )
    }
    //결제 미완료
    return (
      //수정하기&결제하기 버튼
      <div className="CompetitionApplyTeamForm-bottom-table-buttons">
        <button
          id="CompetitionApplyTeamForm-bottom-table-buttons-save"
          onClick={() => {
            patchClick()
          }}>
          수정하기
        </button>
        <button
          id="CompetitionApplyTeamForm-bottom-table-buttons-register"
          onClick={() => {
            setPaymentmodal(pre => !pre)
          }}>
          결제하기
        </button>
      </div>
    )
  }

  //(오칸 코드) 테이블 렌더
  function renderCompetitionApplicationList() {
    return competitionApplicationList.map((application, i) => {
      return (
        <ul key={i} className="CompetitionApplyTeamForm-bottom-table-row">
          <li>{i + 1}</li>
          <li>{application.playerName}</li>
          <li>{application.playerBirth}</li>
          <li>{application.gender == 'female' ? '여자' : '남자'}</li>
          <li>{application.uniform == 'gi' ? '기' : '노기'}</li>
          <li>{application.divisionName}</li>
          <li>{application.belt}</li>
          <li>{application.weight}</li>
          <li>{application.pricingPolicy.normal}원</li>
        </ul>
      )
    })
  }

  useEffect(() => {
    if (decodedToken) {
      // 레벨 1인 유저가 들어오면 다시 수정페이지로 리다이렉트
      if (decodedToken.userLevel == 1) {
        alert('회원가입을 완료해주세요')
        navigate('/UserInfopage')
      }
    }

    getCompetitionApplicationInfo()
  }, [decodedToken])

  useEffect(() => {
    console.log(rawCompetitionApplicationInfo)
  }, [rawCompetitionApplicationInfo])

  return (
    <div className="ProfileInfo_wrapper">
      <div className="ProfileInfo_title">
        <a
          onClick={() => {
            navigate(`/Profilepage/`)
          }}>
          <img src={arrowLeftIcon} alt="이전으로 돌아가기"></img>
        </a>
        <h2>{competitionApplicationInfo.title}</h2>
      </div>
      <div className="ProfileInfo_competition">
        <div className="ProfileInfo_competition_Left">
          <img src={competitionApplicationInfo.postUrl} alt="대회포스터"></img>
          <h2
            onClick={() => {
              navigate(
                `/competition/${competitionApplicationInfo.competitionId}`
              )
            }}>
            대회상세보기 {'>'}
          </h2>
        </div>
        <div className="ProfileInfo_competition_Right">
          <div className="ProfileInfo_competition_date">
            <h3>대회 날짜</h3>
            <p>{competitionApplicationInfo.doreOpen}</p>
          </div>
          <div className="ProfileInfo_competition_date">
            <h3>대회 장소</h3>
            <p>{competitionApplicationInfo.location}</p>
          </div>
          <div className="ProfileInfo_competition_date">
            <h3>얼리버드 마감</h3>
            <p>{competitionApplicationInfo.earlyBirdDeadline}</p>
          </div>
          <div className="ProfileInfo_competition_date">
            <h3>참가신청 마감</h3>
            <p>{competitionApplicationInfo.registrationDeadline}</p>
          </div>
          <div className="ProfileInfo_competition_date">
            <h3>신청자 명단</h3>
            <p>{competitionApplicationInfo.applicantTableOpenDate}</p>
          </div>
          <div className="ProfileInfo_competition_date">
            <h3>대진표 공개</h3>
            <p>{competitionApplicationInfo.tournamentTableOpenDate}</p>
          </div>
        </div>
      </div>
      <div className="ProfileInfo_user">
        <h2>대표 정보</h2>
        <div className="ProfileInfo_userInfo_Wrap">
          <div className="ProfileInfo_userInfo ProfileInfo_userInfo_team">
            <h3>팀 이름</h3>
            <p>{competitionApplicationInfo.team}</p>
          </div>
          <div className="ProfileInfo_userInfo">
            <h3>대표 번호</h3>
            <p>{competitionApplicationInfo.phoneNumber}</p>
          </div>
        </div>
      </div>
      <div className="ProfileInfo_userList">
        <h2>신청자 명단({competitionApplicationInfo.isGroup})</h2>
        {/* 오칸 코드 가져온 부분 - 시작 */}
        <div className="CompetitionApplyTeamForm-bottom">
          {/* 오칸 코드 가져온 부분 - 신청명단 테이블*/}
          <div
            className="CompetitionApplyTeamForm-bottom-table"
            id="ProfileInfo-bottom">
            <ul className="CompetitionApplyTeamForm-bottom-table-column">
              <li>No.</li>
              <li>이름</li>
              <li>생년월일</li>
              <li>성별</li>
              <li>기/노기</li>
              <li>부문</li>
              <li>벨트</li>
              <li>체급</li>
              <li>참가비</li>
            </ul>
            {renderCompetitionApplicationList()}
          </div>
          <div className="CompetitionApplyTeamForm-bottom-table-results">
            <div className="CompetitionApplyTeamForm-bottom-table-result CompetitionApplyTeamForm-bottom-table-result-red">
              <h3 id="CompetitionApplyTeamForm-bottom-table-result-key">
                총 할인금액
              </h3>
              <h3>
                {rawCompetitionApplicationInfo.expectedPrice
                  ? rawCompetitionApplicationInfo.expectedPrice.normalPrice -
                    competitionApplicationInfo.amount
                  : 0}
                원
              </h3>
            </div>
            <div className="CompetitionApplyTeamForm-bottom-table-result">
              <h3 id="CompetitionApplyTeamForm-bottom-table-result-key">
                총 결제금액
              </h3>
              <h3>{competitionApplicationInfo.amount}원</h3>
            </div>
          </div>
          {renderButton(competitionApplicationInfo)}
        </div>
        {/* 오칸 코드 가져온 부분 - 끝 */}
      </div>
      {paymentmodal && (
        <Paymentmodal
          closeModal={() => setPaymentmodal(pre => !pre)}
          paymentmethod={paymentmethod}
          setPaymentmethod={setPaymentmethod}
          easypaymethod={easypaymethod}
          setEasypaymethod={setEasypaymethod}
          discountedprice={
            competitionApplicationInfo ? competitionApplicationInfo.amount : 0
          }
          normalprice={
            rawCompetitionApplicationInfo.expectedPrice
              ? rawCompetitionApplicationInfo.expectedPrice.normalPrice
              : 0
          }
          tossPay={tossPay}
        />
      )}
    </div>
  )
}

export default ProfileInfo
