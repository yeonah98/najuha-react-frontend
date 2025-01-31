import React from 'react'
import './profileTap.css'
import { useNavigate } from 'react-router-dom'

function ProfileTap(props) {
  let userName = props.userName
  let competitionApplications = props.competitionApplications
  const navigate = useNavigate()

  //실시간 대회 수 그리기
  function renderCompetitonNowCount() {
    let nowCnt = 0
    competitionApplications.map(application => {
      let competitionDate = new Date(application.Competition.doreOpen)
      let today = new Date()
      if (today <= competitionDate) {
        nowCnt++
      }
    })
    return <p className="ProfileTap_competitionCount-box-num">{nowCnt}</p>
  }

  //총 대회 수 그리기
  function renderCompetitonTotalCount() {
    let totalCnt = competitionApplications.length
    return <p className="ProfileTap_competitionCount-box-num">{totalCnt}</p>
  }

  return (
    <section
      className="ProfileTap_wrapper"
      id={props?.disapper ? 'ProfileTap_dissaper' : 'ProfileTap_live'}
    >
      <div className="ProfileTap_welcome">
        <div className="ProfileTap_welcome-center">
          <p>
            <span className="ProfileTap_welcome-center-username">
              {userName}
            </span>
            님<br></br>
            안녕하세요
          </p>
        </div>
      </div>
      <div className="ProfileTap_competitionCount">
        <div className="ProfileTap_competitionCount-box nowCnt">
          <div className="ProfileTap_competitionCount-box-center">
            {renderCompetitonNowCount()}
            <p>실시간 대회신청</p>
          </div>
        </div>
        <div className="ProfileTap_competitionCount-box totalCnt">
          <div className="ProfileTap_competitionCount-box-center">
            {renderCompetitonTotalCount()}
            <p>총 대회신청</p>
          </div>
        </div>
      </div>
      <div className="ProfileTap_information">
        <li>
          <div
            className="ProfileTap_information-btn"
            onClick={() => {
              navigate('/Profilepage', { state: 'UserApplicationList' })
            }}
          >
            신청대회 목록
          </div>
          <div
            className="ProfileTap_information-btn"
            onClick={() => {
              navigate('/Profilepage', { state: 'UserInfo' })
            }}
          >
            내 프로필
          </div>
          {/* <div className="ProfileTap_information-btn">개인정보처리방침</div>
          <div className="ProfileTap_information-btn">이용약관</div>
          <div className="ProfileTap_information-btn">버전정보</div> */}
        </li>
      </div>
    </section>
  )
}

export default ProfileTap
