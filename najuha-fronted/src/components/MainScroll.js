import React, {useEffect, useState} from 'react'
import './mainScroll.css'
import AOS from "aos";
import "aos/dist/aos.css";
import gymFront from '../src_assets/체육관_앞.png'
import gymBackground from '../src_assets/체육관_뒤.png'
import players from '../src_assets/선수들.png'
import competitionBackgruond from '../src_assets/대회장.png'
import competitionFull from '../src_assets/대회장전체.png'
import phone from '../src_assets/폰목업.png'
import whiteBelt from '../src_assets/whiteBelt.svg';
import grayBelt from '../src_assets/grayBelt.svg';
import backgroundImg from '../src_assets/jiujitsuGuys.jpg'
import monitor from '../src_assets/모니터.png'
import phone1 from '../src_assets/폰1.png'

function  MainScroll() {
    const [ScrollActive, setScrollActive] = useState(false);
    const [ScrollY, setScrollY] = useState(0); // window 의 pageYOffset값을 저장
    const [width, setWidth] = useState('100vw');
    const [height, setHeight] = useState('100vh');
    const [zoom, setZoom] = useState(1);
    const [bgColor, setBgColor] = useState("rgba(0, 0, 0, 0.5)");
    const [bgColorW, setBgColorW] = useState("rgba(255, 255, 255, 0)");


    function handleScroll() { 
        console.log('스크롤 ' +ScrollY)
        if(ScrollY <= 1700) {
            setBgColor('rgba(0, 0, 0, 0)');
            setBgColorW("rgba(255, 255, 255, 0)");
        }
        if(ScrollY > 1700) {
            setScrollActive(true);

            const scrollTop = window.pageYOffset;
            const scrollFraction = (scrollTop - 1700) / window.innerHeight;
            const zoomLevel = 1 + scrollFraction;
            setZoom(zoomLevel > 1 ? zoomLevel : 1);

            if (scrollTop < 3100) {
                const newBgColor = `rgba(0, 0, 0, ${(scrollTop - 1700) / 1000})`;
                setBgColor(newBgColor);
            } else if (scrollTop >= 3100) {
                setBgColor('rgba(0, 0, 0, 0.4)')
                const newBgColor = `rgba(255, 255, 255, ${(scrollTop - 3100) / 500})`;
                setBgColorW(newBgColor);
            }

            setScrollY(window.pageYOffset);

        } else {
            setScrollY(window.pageYOffset);
            setScrollActive(false);
        }
    }
    useEffect(() => {
        function scrollListener() {  window.addEventListener("scroll", handleScroll); } //  window 에서 스크롤을 감시 시작
        scrollListener(); // window 에서 스크롤을 감시
        return () => { window.removeEventListener("scroll", handleScroll); }; //  window 에서 스크롤을 감시를 종료
    });

    useEffect(() => {
        AOS.init();
      })
   
    return (
        
        <div className='MainScroll_wrapper'>

            <div className='MainScroll_nav' style={ (ScrollY > 3600) ? {backgroundColor:'white'} : {} }>
                <h1 className='MainScroll_logo' style={ (ScrollY > 3600) ? {color:'black'} : {} }>NAJUHA</h1>
                <div className='MainScroll_list'>
                    <ul className='MainScroll_menu' style={ (ScrollY > 3600) ? {color:'#888888'} : {} }>
                        <li>대회일정</li>
                        <li>세미나</li>
                    </ul>
                    <img class='MainScroll_belt' alt="벨트모양 로그인 아이콘" src={ (ScrollY > 3600) ? grayBelt : whiteBelt } style={ (ScrollY > 3600) ? {backgroundColor:'rgba(238, 238, 238, 0.48)'} : {backgroundColor:'rgba(238, 238, 238, 0.01)'} }/>
                </div>
            </div>

            <div className='MainScroll_section1'>
                <img style={ {transform: `scale(${zoom})`} } className='MainScroll_bgImg' src={backgroundImg} alt="배경 이미지"></img>
                <div className='MainScroll_black'></div>
                <div className='MainScroll_message'>
                    <h1 className={ (ScrollY > 350) ? ( (ScrollY > 1700) ? 'MainScroll_fadeout' : 'MainScroll_fadein' ) : 'MainScroll_none' }><span>나</span> 는</h1>
                    <h1 className={ (ScrollY > 700) ? ( (ScrollY > 1700) ? 'MainScroll_fadeout' : 'MainScroll_fadein' ) : 'MainScroll_none' }><span>주</span> 짓수가</h1>
                    <h1 className={ (ScrollY > 1050) ? ( (ScrollY > 1700) ? 'MainScroll_fadeout' : 'MainScroll_fadein' ) : 'MainScroll_none' }><span>하</span> 고싶다</h1>
                </div>
                <div className='MainScroll_message2'>
                    <h2 className={ (ScrollY > 2000) ? ( (ScrollY > 3100) ? 'MainScroll_fadeout' : 'MainScroll_fadein' ) : 'MainScroll_none' }>대회를 한 번에 보고싶었던 경험</h2>
                    <h2 className={ (ScrollY > 2400) ? ( (ScrollY > 3100) ? 'MainScroll_fadeout' : 'MainScroll_fadein' ) : 'MainScroll_none' }>내가 신청한 대회를 바로 확인하고 싶던 경험</h2>
                    <h2 className={ (ScrollY > 2800) ? ( (ScrollY > 3100) ? 'MainScroll_fadeout' : 'MainScroll_fadein' ) : 'MainScroll_none' }>나주하에서는 다 가능합니다</h2>
                </div>
                <div className='MainScroll_black2' style={{ backgroundColor: bgColor }} ></div>
                <div className='MainScroll_black2' style={{ backgroundColor: bgColorW }} ></div>
            </div>
            <div className='MainScroll_section1-1'></div>

            <div className='MainScroll_section2'>
                <div data-aos="fade-up" className='MainScroll_title1'>
                    <h1>전국에 있는</h1>
                    <h1>주짓수 대회를</h1>
                    <h1>한 눈에.</h1>
                    <div className='MainScroll_blueLine'></div>
                </div>
                <div data-aos="fade-up">
                    <h2> 대회조회부터 상세정보까지 간편하게 확인해보세요.</h2>
                </div>
                <div>
                    <img data-aos="fade-up" src={monitor} alt='모니터'></img>
                </div>
            </div>

            <div className='MainScroll_linear1'></div>

            <div className='MainScroll_section3'>
                <div data-aos="fade-up" className='MainScroll_title2'>
                    <h1>대회신청부터</h1>
                    <h1>대회결제까지</h1>
                    <h1>한 번에.</h1>
                    <div className='MainScroll_blueLine2'></div>
                </div>
                <img data-aos="fade-up" src={phone1} alt='핸드폰사진'></img>
            </div>

        </div>
    )
}

export default MainScroll