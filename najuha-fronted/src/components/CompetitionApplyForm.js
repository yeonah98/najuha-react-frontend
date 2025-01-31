import React, { useEffect, useState } from 'react'
import './competitionApplyForm.css'
import reseticon from '../src_assets/리셋아이콘.svg'
import notcomplete from '../src_assets/미완료아이콘.svg'
import plus from '../src_assets/대회추가아이콘.svg'
import { useParams } from 'react-router-dom'
import ApplyModal from './ApplyModal'
import Paymentbridgemodal from './Paymentbridgemodal'
import Paymentmodal from './Paymentmodal'
import deleteicon from '../src_assets/명단삭제로고.svg'
import {
  getCompetitionDetail,
  getCompetitionPricePredict,
} from '../apis/api/competition'
import { postCompetitionApplication } from '../apis/api/competitionApplications'

function CompetitionApplyForm() {
  const { id } = useParams()
  const [discountedprice, setDiscountedprice] = useState(0)
  const [normalprice, setNormalprice] = useState(0)
  const [competition, setCompetition] = useState(null)
  const [applymodal, setapplymodal] = useState(false)
  const [paymentbridgemodal, setPaymentbridgemodal] = useState(false)
  const [paymentmodal, setPaymentmodal] = useState(false)
  const [fillteredcompetition, setFillteredCompetition] = useState(null)
  const [competitionApplicationId, setCompetitionApplicationId] = useState(null)
  const [viewcompetitionApplicationList, setviewCompetitionApplicationList] =
    useState([
      {
        playerName: '',
        playerBirth: '',
        phoneNumber: '',
        uniform: null,
        divisionName: null,
        gender: null,
        belt: null,
        weight: null,
        team: '',
        competitionId: id,
        price: null,
        check: 0,
      },
    ])

  const parsingbeforeapplypost = viewcompetitionApplicationList => {
    let copyList = JSON.parse(JSON.stringify(viewcompetitionApplicationList))
    copyList.map(competitionapply => {
      delete competitionapply['price']
      delete competitionapply['check']
    })
    return copyList
  }

  const parsingbeforegetprice = viewcompetitionApplicationList => {
    let copyList = JSON.parse(JSON.stringify(viewcompetitionApplicationList))
    copyList.map((competitionapply, i) => {
      if (competitionapply.price === null) {
        copyList.splice(i, 1)
        return true
      }
      delete competitionapply['price']
      delete competitionapply['check']
      delete competitionapply['playerName']
      delete competitionapply['team']
      delete competitionapply['competitionId']
      delete competitionapply['playerBirth']
      delete competitionapply['phoneNumber']
    })
    return copyList
  }

  const getCompetition = async id => {
    let res = await getCompetitionDetail(id)
    if (res?.status === 200) {
      const newCompetition = res.data.result
      setCompetition(newCompetition)
      setFillteredCompetition(newCompetition.division)
    }
  }

  // 예상 가격 가져오기
  const getTotalPrice = async id => {
    let parsedlist = parsingbeforegetprice(viewcompetitionApplicationList)
    let res = await getCompetitionPricePredict(id, {
      isGroup: false,
      divisions: parsedlist,
    })
    if (res?.status === 200) {
      setDiscountedprice(res.data.result.discountedPrice)
      setNormalprice(res.data.result.normalPrice)
    }
  }

  // 대회 참가 신청하기
  async function postCompetition() {
    let competitionApplicationList = parsingbeforeapplypost(
      viewcompetitionApplicationList
    )
    let res = await postCompetitionApplication({ competitionApplicationList })
    if (res?.status === 200) {
      setCompetitionApplicationId(res.data.result.competitionApplicationId)
      setapplymodal(pre => !pre)
      setPaymentbridgemodal(pre => !pre)
    }
  }

  useEffect(() => {
    getCompetition(id)
  }, [])

  useEffect(() => {
    if (viewcompetitionApplicationList[0].price != null) {
      if (viewcompetitionApplicationList.length > 0) getTotalPrice(id)
    } else {
      priceRefresh()
    }
  }, [
    viewcompetitionApplicationList.length,
    viewcompetitionApplicationList[viewcompetitionApplicationList.length - 1]
      .price,
  ])

  const curApplicationReset = i => {
    let cal = [...viewcompetitionApplicationList]
    cal[i] = {
      playerName: '',
      playerBirth: '',
      phoneNumber: '',
      uniform: null,
      divisionName: null,
      gender: null,
      belt: null,
      weight: null,
      team: '',
      competitionId: id,
      price: null,
      check: 0,
    }
    setviewCompetitionApplicationList(cal)
    setFillteredCompetition(competition.division)
  }

  const curApplicationcomplete = i => {
    let cal = [...viewcompetitionApplicationList]
    cal[i].price = fillteredcompetition[0].pricingPolicy.normal
    setviewCompetitionApplicationList(cal)
  }

  const addApplication = i => {
    let cal = [...viewcompetitionApplicationList]
    cal[i].check = 1
    cal.push({
      playerName: '',
      playerBirth: '',
      phoneNumber: '',
      uniform: null,
      divisionName: null,
      gender: null,
      belt: null,
      weight: null,
      team: '',
      competitionId: id,
      price: null,
      check: 0,
    })
    setviewCompetitionApplicationList(cal)
    setFillteredCompetition(competition.division)
  }

  const checkGender = cal => {
    for (let i = 0; i < cal.length; i++) {
      if (cal[0].gender != cal[i].gender) return false
    }
    return true
  }

  const checkInvaildApply = () => {
    let cal = [...viewcompetitionApplicationList]
    cal.forEach((x, i) => {
      if (x.price == null) {
        cal.splice(i, 1)
      }
    })
    if (cal.length >= 1) {
      if (checkGender(cal)) {
        setviewCompetitionApplicationList(cal)
        return true
      }
      alert('신청하는 디비전의 성별이 동일해야 합니다.')
      return false
    }
    alert('신청을 끝까지 완료해주셔야 합니다.')
    return false
  }

  function priceRefresh() {
    setNormalprice(0)
    setDiscountedprice(0)
  }

  function deleteCompetitionApplication(i) {
    let copy = [...viewcompetitionApplicationList]
    if (viewcompetitionApplicationList.length === 1) {
      copy[0] = {
        playerName: '',
        playerBirth: '',
        phoneNumber: '',
        uniform: null,
        divisionName: null,
        gender: null,
        belt: null,
        weight: null,
        team: null,
        competitionId: id,
        price: null,
        check: 0,
      }
      setviewCompetitionApplicationList(copy)
      setFillteredCompetition(competition.division)
      return
    }
    copy.splice(i, 1)
    setviewCompetitionApplicationList(copy)
  }

  const applicationDetailUI = () => {
    return viewcompetitionApplicationList.map((application, i) => {
      return (
        <ul className="CompetitionApplyForm-top-table-item" key={i}>
          <li>{application.uniform}</li>
          <li>{application.divisionName}</li>
          <li>{application.gender}</li>
          <li>{application.belt}</li>
          <li>{application.weight}</li>
          <li>{application.price}</li>
          {application.price != null ? (
            <img
              style={{ cursor: 'pointer' }}
              src={deleteicon}
              onClick={() => deleteCompetitionApplication(i)}
            ></img>
          ) : (
            ''
          )}
        </ul>
      )
    })
  }

  const constfillteringcompetition = (value, part) => {
    let newfillteredcompetition = fillteredcompetition.filter(
      div => div.constantFactor[part] == value
    )
    setFillteredCompetition(newfillteredcompetition)
  }

  const varfillteringcompetition = (value, part) => {
    let newfillteredcompetition = fillteredcompetition.filter(div =>
      div.variableFactor[part].includes(value)
    )
    setFillteredCompetition(newfillteredcompetition)
  }

  const chooseUniformOption = (value, i) => {
    let cal = [...viewcompetitionApplicationList]
    cal[i].uniform = value
    setviewCompetitionApplicationList(cal)
    constfillteringcompetition(value, 'uniform')
  }

  const chooseDivisionOption = (value, i) => {
    let cal = [...viewcompetitionApplicationList]
    cal[i].divisionName = value
    setviewCompetitionApplicationList(cal)
    constfillteringcompetition(value, 'divisionName')
  }

  const chooseGenderOption = (value, i) => {
    let cal = [...viewcompetitionApplicationList]
    cal[i].gender = value
    setviewCompetitionApplicationList(cal)
    constfillteringcompetition(value, 'gender')
  }

  const chooseWeightOption = (value, i) => {
    let cal = [...viewcompetitionApplicationList]
    cal[i].weight = value
    setviewCompetitionApplicationList(cal)
    varfillteringcompetition(value, 'weight')
  }

  const chooseBeltOption = (value, i) => {
    let cal = [...viewcompetitionApplicationList]
    cal[i].belt = value
    setviewCompetitionApplicationList(cal)
    varfillteringcompetition(value, 'belt')
  }

  const changePlayerName = value => {
    let cal = [...viewcompetitionApplicationList]
    cal.map(x => {
      x.playerName = value
    })
    setviewCompetitionApplicationList(cal)
  }

  const changePlayerBirth = value => {
    let cal = [...viewcompetitionApplicationList]
    cal.map(x => {
      x.playerBirth = value
    })
    setviewCompetitionApplicationList(cal)
  }

  const changephoneNumber = value => {
    let cal = [...viewcompetitionApplicationList]
    cal.map(x => {
      x.phoneNumber = value
    })
    setviewCompetitionApplicationList(cal)
  }

  const changeTeam = value => {
    let cal = [...viewcompetitionApplicationList]
    cal.map(x => {
      x.team = value
    })
    setviewCompetitionApplicationList(cal)
  }

  const chooseOptionUI = (application, i) => {
    if (application.uniform == null) {
      let comuniform = []
      fillteredcompetition.map((com, j) => {
        comuniform.push(com.constantFactor.uniform)
      })
      comuniform = [...new Set(comuniform)]
      return comuniform.map((el, h) => {
        return (
          <li key={h} onClick={() => chooseUniformOption(el, i)}>
            {el == 'gi' ? '기' : '노기'}
          </li>
        )
      })
    } else if (application.divisionName == null) {
      let comdi = []
      fillteredcompetition.map((com, j) => {
        comdi.push(com.constantFactor.divisionName)
      })
      comdi = [...new Set(comdi)]
      return comdi.map((el, h) => {
        return (
          <li key={h} onClick={() => chooseDivisionOption(el, i)}>
            {el}
          </li>
        )
      })
    } else if (application.gender == null) {
      let comgender = []
      fillteredcompetition.map((com, j) => {
        comgender.push(com.constantFactor.gender)
      })
      comgender = [...new Set(comgender)]
      return comgender.map((el, h) => {
        return (
          <li key={h} onClick={() => chooseGenderOption(el, i)}>
            {el}
          </li>
        )
      })
    } else if (application.belt == null) {
      let combelt = []
      fillteredcompetition.map((com, j) => {
        com.variableFactor.belt.map((bel, g) => {
          combelt.push(bel)
        })
      })
      combelt = [...new Set(combelt)]
      return combelt.map((el, h) => {
        return (
          <li key={h} onClick={() => chooseBeltOption(el, i)}>
            {el}
          </li>
        )
      })
    } else if (application.weight == null) {
      let comweight = []
      fillteredcompetition.map((com, j) => {
        com.variableFactor.weight.map((wei, g) => {
          comweight.push(wei)
        })
      })
      comweight = [...new Set(comweight)]
      return comweight.map((el, h) => {
        return (
          <li key={h} onClick={() => chooseWeightOption(el, i)}>
            {el}
          </li>
        )
      })
    }
  }

  // const optionUI = () => {
  //     return viewcompetitionApplicationList.map((application, i) => {
  //         return(
  //         <>
  //             {!application.check ? <>
  //                 <div className='CompetitionApplyForm-middle-function'>
  //                 <div className='CompetitionApplyForm-middle-function-re'>
  //                     <img src={reseticon} style={{cursor: 'pointer'}} onClick={() => curApplicationReset(i)}/>
  //                     <p>다시하기</p>
  //                 </div>
  //                 <div className='CompetitionApplyForm-middle-function-complete'>
  //                     {application.price  ? <><img src={plus} style={{cursor: 'pointer'}} onClick={() => addApplication(i)}/>
  //                     <p>대회추가</p></> :
  //                     (application.weight ? <><img src={notcomplete} style={{cursor: 'pointer'}} onClick={() => curApplicationcomplete(i)}/><p>선택완료</p></>
  //                     : <><img src={notcomplete}/><p>선택완료</p></>)}
  //                 </div>
  //             </div>
  //             <ul className='CompetitionApplyForm-middle-option'>
  //                 {fillteredcompetition != null ? (application.check == 0 ? chooseOptionUI(application, i) : '') : ''}
  //             </ul>
  //             {application.price  ? <h2 className='CompetitionApplyForm-middle-info-checkmessage'>대회를 더 신청하고자 한다면<br/> + 버튼을 클릭해주세요</h2> : application.weight == null ? <h2 className='CompetitionApplyForm-middle-info'>신청할 대회를 선택하세요</h2> : <h2 className='CompetitionApplyForm-middle-info-checkmessage'>해당 대회를 신청하고자 한다면 <br/> 선택완료를 클릭해주세요</h2>}
  //             </> : ''}
  //         </>
  //         )
  //     })
  // }
  const optionUI = () => {
    return (
      <>
        <div className="CompetitionApplyForm-middle-function">
          <div className="CompetitionApplyForm-middle-function-re">
            {viewcompetitionApplicationList[
              viewcompetitionApplicationList.length - 1
            ].price != null ? (
              <img src={reseticon} />
            ) : (
              <img
                src={reseticon}
                style={{
                  cursor: 'pointer',
                }}
                onClick={() =>
                  curApplicationReset(viewcompetitionApplicationList.length - 1)
                }
              />
            )}
            <p>다시하기</p>
          </div>
          <div className="CompetitionApplyForm-middle-function-complete">
            {viewcompetitionApplicationList[
              viewcompetitionApplicationList.length - 1
            ].price ? (
              <>
                <img
                  src={plus}
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    addApplication(viewcompetitionApplicationList.length - 1)
                  }
                />
                <p>대회추가</p>
              </>
            ) : viewcompetitionApplicationList[
                viewcompetitionApplicationList.length - 1
              ].weight ? (
              <>
                <img
                  src={notcomplete}
                  style={{
                    cursor: 'pointer',
                    filter:
                      'invert(43%) sepia(96%) saturate(463%) hue-rotate(183deg) brightness(96%) contrast(87%)',
                  }}
                  onClick={() =>
                    curApplicationcomplete(
                      viewcompetitionApplicationList.length - 1
                    )
                  }
                />
                <p>선택완료</p>
              </>
            ) : (
              <>
                <img src={notcomplete} />
                <p>선택완료</p>
              </>
            )}
          </div>
        </div>
        <ul className="CompetitionApplyForm-middle-option">
          {fillteredcompetition != null
            ? viewcompetitionApplicationList[
                viewcompetitionApplicationList.length - 1
              ].check == 0
              ? chooseOptionUI(
                  viewcompetitionApplicationList[
                    viewcompetitionApplicationList.length - 1
                  ],
                  viewcompetitionApplicationList.length - 1
                )
              : ''
            : ''}
        </ul>
        {viewcompetitionApplicationList[
          viewcompetitionApplicationList.length - 1
        ].price ? (
          <h2 className="CompetitionApplyForm-middle-info-checkmessage">
            대회를 더 신청하고자 한다면
            <br /> <span>+ 버튼</span>을 클릭해주세요
          </h2>
        ) : viewcompetitionApplicationList[
            viewcompetitionApplicationList.length - 1
          ].weight == null ? (
          <h2 className="CompetitionApplyForm-middle-info">
            신청할 대회를 선택하세요
          </h2>
        ) : (
          <h2 className="CompetitionApplyForm-middle-info-checkmessage">
            해당 대회를 신청하고자 한다면 <br /> <span>선택완료</span>를
            클릭해주세요
          </h2>
        )}
      </>
    )
  }

  return (
    <div className="CompetitionApplyForm-wrapper">
      <div className="CompetitionApplyForm-top">
        <h2 className="CompetitionApplyForm-top-title">
          {competition != null ? competition.title : ''}
        </h2>
        <div className="CompetitionApplyForm-top-table">
          <ul className="CompetitionApplyForm-top-table-standard">
            <li>기노기</li>
            <li>부문</li>
            <li>성별</li>
            <li>벨트</li>
            <li>체급</li>
            <li>참가비</li>
          </ul>
          {applicationDetailUI()}
        </div>
      </div>
      <div className="CompetitionApplyForm-middle">{optionUI()}</div>
      <div className="CompetitionApplyForm-bottom">
        <div className="CompetitionApplyTeamForm-bottom-table-results">
          <div className="CompetitionApplyTeamForm-bottom-table-result CompetitionApplyTeamForm-bottom-table-result-red">
            <h3 id="CompetitionApplyTeamForm-bottom-table-result-key">
              총 할인금액
            </h3>
            <h3>{normalprice - discountedprice}원</h3>
          </div>
          <div className="CompetitionApplyTeamForm-bottom-table-result">
            <h3 id="CompetitionApplyTeamForm-bottom-table-result-key">
              총 결제금액
            </h3>
            <h3>{discountedprice}원</h3>
          </div>
        </div>
        <button
          className="CompetitionApplyForm-bottom-payment"
          onClick={() => {
            if (checkInvaildApply()) {
              window.scrollTo(0, 0)
              setapplymodal(!applymodal)
            }
          }}
        >
          신청하기
        </button>
        {applymodal && (
          <ApplyModal
            closeModal={() => setapplymodal(pre => !pre)}
            changePlayerName={changePlayerName}
            changePlayerBirth={changePlayerBirth}
            changephoneNumber={changephoneNumber}
            changeTeam={changeTeam}
            postCompetition={postCompetition}
            viewcompetitionApplicationList={viewcompetitionApplicationList}
          />
        )}
        {competitionApplicationId && paymentbridgemodal && (
          <Paymentbridgemodal
            closeModal={() => setPaymentbridgemodal(pre => !pre)}
            openNextModal={() => setPaymentmodal(pre => !pre)}
          />
        )}
        {paymentmodal && (
          <Paymentmodal
            closeModal={() => setPaymentmodal(pre => !pre)}
            discountedprice={discountedprice}
            normalprice={normalprice}
            competitionApplicationId={competitionApplicationId}
          />
        )}
      </div>
    </div>
  )
}

export default CompetitionApplyForm
