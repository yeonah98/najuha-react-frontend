import React from 'react'
import { useState, useEffect } from 'react'
import './userApplicationList.css'
import { useNavigate } from 'react-router-dom'
import xIcon from '../src_assets/x.svg'
import samplePoster from '../src_assets/samplePoster.png'
import { deleteUserApplicationCompetition } from '../apis/api/user'

function UserApplicationList(props) {
  const [clickedList, setclickedList] = useState('person')
  const [active, setActive] = useState(['UserApplicationList_active', '', ''])
  const navigate = useNavigate()
  const userLevel = props.userLevel
  let competitionApplications = props.competitionApplications

  // 신청 대회 지우기(결제 미완료)
  async function deleteCompetitionApplication(id) {
    const res = await deleteUserApplicationCompetition(id)
    if (res?.status === 200) {
      alert('대회가 삭제되었습니다.')
      props.getCompetitionApplication()
      return
    }
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

  //요일 값 구하기
  function getDayOfWeek(날짜문자열) {
    //ex) getDayOfWeek('2022-06-13')

    const week = ['일', '월', '화', '수', '목', '금', '토']

    const dayOfWeek = week[new Date(날짜문자열).getDay()]

    return dayOfWeek
  }

  //신청대회 데이터 파싱
  function applicationParsing(application) {
    let today = new Date()
    let id = application.id
    let host = application.Competition.host
    let title =
      application.Competition.title.length > 44
        ? application.Competition.title.substr(0, 24) + '...'
        : application.Competition.title
    let location = application.Competition.location
    let amount =
      today > new Date(application.Competition.earlyBirdDeadline)
        ? application.expectedPrice.earlyBirdFalse
        : application.expectedPrice.earlyBirdTrue
    let doreOpen = application.Competition.doreOpen
      .substr(5, 5)
      .replace('-', '.')
    let day = getDayOfWeek(application.Competition.doreOpen)
    let registrationDeadline =
      today > new Date(application.Competition.registrationDeadline)
        ? false
        : true
    let postUrl = application.Competition.CompetitionPoster
      ? application.Competition.CompetitionPoster.imageUrl
      : samplePoster
    let isPayment = application.isPayment ? '결제완료' : '결제하기'
    let isCanceled =
      application.competitionPayment === null
        ? ' '
        : application.competitionPayment.status // 'CANCELED'면 환불완료
    let isGroup = application.isGroup
    let costMsg = application.isPayment ? '총 결제금액' : '예상 결제금액'
    let payCss =
      isPayment === '결제하기' && registrationDeadline === true
        ? 'UserApplicationList_costLayout UserApplicationList_payCss'
        : 'UserApplicationList_costLayout'
    let last =
      today < new Date(application.Competition.doreOpen)
        ? ' '
        : 'UserApplicationList_lastCompetiton'
    // let divisionName = application.divisionName;
    // let belt = application.belt.charAt(0).toUpperCase() + application.belt.slice(1);
    // let uniform = (application.uniform = "gi") ? '기-' : '노기-';
    // let weight = application.weight + 'kg';

    return {
      id: id,
      host: host,
      title: title,
      location: location,
      amount: amount, //위에서 오늘날짜랑 비교해서 얼리버드 할인 알아서 적용한 값
      doreOpen: doreOpen,
      day: day,
      registrationDeadline: registrationDeadline, //false면 신청마감
      isPayment: registrationDeadline
        ? isPayment
        : isPayment == '결제완료'
        ? isPayment
        : '신청마감',
      isCanceled: isCanceled === 'CANCELED' ? true : false,
      isGroup: isGroup, //false 면 개인, true면 단체
      costMsg: costMsg,
      payCss: payCss,
      postUrl: postUrl,
      last: last,
    }
  }

  //실시간 대회 렌더
  function renderCompetition() {
    return competitionApplications.map(application => {
      let curApplication = applicationParsing(application)
      let today = new Date()
      curApplication.isPayment = curApplication.isCanceled
        ? '환불완료'
        : curApplication.isPayment

      let xButton
      let xButtonDiv
      if (
        curApplication.isPayment === '결제하기' ||
        curApplication.isPayment === '신청마감'
      ) {
        xButton = 'UserApplicationList_boxDelete'
        xButtonDiv = ' '
      } else {
        xButton =
          'UserApplicationList_boxDelete UserApplicationList_boxDeleteHidden'
        xButtonDiv = 'UserApplicationList_deleteNone'
      }

      if (clickedList === 'person') {
        //날짜가 오늘을 기준으로 지났으면 안보여주기(오늘은 보여줌)
        if (today >= new Date(application.Competition.doreOpen)) {
          return
        }
        //단체신청이면 안보여주기
        if (curApplication.isGroup) {
          return
        }
      }
      if (clickedList === 'group') {
        //날짜가 오늘을 기준으로 지났으면 안보여주기(오늘은 보여줌)
        if (today >= new Date(application.Competition.doreOpen)) {
          return
        }
        //개인신청이면 안보여주기
        if (!curApplication.isGroup) {
          return
        }
      }
      if (clickedList === 'last') {
        //날짜가 오늘을 기준으로 안지났으면 안보여주기
        if (today < new Date(application.Competition.doreOpen)) {
          return
        }
      }

      return (
        <div key={curApplication.id}>
          <div className={curApplication.last}>
            <div className="UserApplicationList_competitoninfo">
              {/* <a onClick={()=>{navigate(`/Profilepage/info/${curApplication.id}`)}}>대회신청내역 상세보기</a>
                            <img src={rightArrow} alt='이동 화살표'></img> */}
            </div>
            <div className="UserApplicationList_competitonbox">
              <div className="UserApplicationList_boxLeft">
                <img src={curApplication.postUrl} alt="대회포스터"></img>
                <p className="UserApplicationList_posterBlack"></p>
                <h3>
                  {curApplication.doreOpen}
                  <span>({curApplication.day})</span>
                </h3>
              </div>
              <div className="UserApplicationList_boxRight">
                <img
                  onClick={() => {
                    onRemove(curApplication.id)
                  }}
                  src={xIcon}
                  alt="삭제 아이콘"
                  className={xButton}
                ></img>
                <div className={xButtonDiv}></div>
                <div className="UserApplicationList_boxRightTitle">
                  <h3
                    onClick={() => {
                      navigate(`/Profilepage/info/${curApplication.id}`)
                    }}
                  >
                    {curApplication.title}
                  </h3>
                  <p>{curApplication.location}</p>
                </div>
              </div>
            </div>
            <div className="UserApplicationList_boxRightCost">
              <div className={curApplication.payCss}>
                <h3>{curApplication.costMsg}</h3>
                <p>{curApplication.amount}</p>
                {/* curApplication.isPayment==='결제하기' 일때만 대회신청내역 상세보기로 이동 실행하기 */}
                <button
                  className="UserApplicationList_costBtn"
                  onClick={() => {
                    navigate(`/Profilepage/info/${curApplication.id}`)
                  }}
                >
                  {curApplication.isPayment}
                </button>
              </div>
            </div>
          </div>

          <hr className="UserApplicationList_competitonHr" />
        </div>
      )
    })
  }

  //탭 클릭 여부
  function isClicked(list, i) {
    let reset = ['', '', '']
    reset[i] = 'UserApplicationList_active'
    setActive(reset)
    setclickedList(list)
  }

  useEffect(() => {
    if (userLevel == 1) {
      alert('회원가입을 완료해주세요')
      navigate('/profilepage', { state: 'UserInfo' })
    }
  }, [userLevel])

  return (
    <>
      <section className="UserApplicationList_right">
        {/* <h2>신청대회 목록</h2> */}
        <div className="UserApplicationList_competitonNavbar">
          <ul className="UserApplicationList_competitonNav">
            <li
              key="개인 신청"
              className={active[0]}
              onClick={() => isClicked('person', 0)}
            >
              개인 신청
            </li>
            <li
              key="단체 신청"
              className={active[1]}
              onClick={() => isClicked('group', 1)}
            >
              단체 신청
            </li>
            <li
              key="지난 신청"
              className={active[2]}
              onClick={() => isClicked('last', 2)}
            >
              지난 대회
            </li>
          </ul>
        </div>
        <div className="UserApplicationList_competitonList">
          {renderCompetition()}
        </div>
      </section>
    </>
  )
}

export default UserApplicationList
