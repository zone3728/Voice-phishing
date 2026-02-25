const SMISHING_SCENARIOS = [
  {
    id: 1,
    title: { t1:"택배·배송 알림", t2:"- 주소 확인·수수료·사진 확인 유도" },
    theme: "galaxy",
    messages: [
      { 
        id:"1A", text:"[CJ대한통운] 도로명 주소 불일치로 배송이 지연되고 있습니다. 바른 주소로 수정 바랍니다.", urlText:"http://cj-logis-check.com/addr",
        cut2: {
          title:"CJ대한통운 배송조회", addr:"http://cj-logis-check.com",
          blocks:[
            { h:"⚠️ 배송 지연 (수수료 안내)", p:"주소 불일치로 배송이 중단되었습니다. 재배송 처리를 위해 수수료 500원 결제가 필요합니다." }
          ],
          trapBtn: "수수료 500원 결제하기"
        },
        cut3: {
          title:"결제 정보 입력",
          blocks:[
            { h:"신용카드 정보 입력", p:"본인 확인 및 500원 결제를 위해 정확한 카드 정보를 입력해 주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">신용카드 번호</span><div class="fake-input">1234-****-****-****</div></div><div class="fake-input-group"><span class="fake-label">비밀번호 앞 2자리</span><div class="fake-input">**</div></div></div>` }
          ],
          quiz: {
            q: "배송 조회를 위해 카드번호와 비밀번호를 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["창을 닫고 공식 택배 앱에서 배송 현황을 직접 조회한다.", "무시하고 스팸으로 신고한다."],
            bad: "[결제하기] 500원 결제를 위해 카드 정보를 입력한다."
          }
        },
        explain: [
          "🚨 피해 발생: 500원을 결제하는 척하면서 당신의 카드 정보를 통째로 복제했습니다. 이 정보로 수백만 원이 해외에서 무단 결제됩니다.",
          "택배사는 절대 문자로 주소 변경 수수료나 개인정보를 요구하지 않습니다."
        ]
      },
      { 
        id:"1B", text:"[우체국] 수취인 부재로 등기우편물이 반송 처리되었습니다. 재배송 요청 바랍니다.", urlText:"http://epost-go-kr.com/req",
        cut2: {
          title:"우체국 등기우편 조회", addr:"http://epost-go-kr.com",
          blocks:[
            { h:"등기물 반송 안내", p:"수취인 부재로 반송 대기 중입니다. 본인 확인 후 재배송을 요청해 주세요." }
          ],
          trapBtn: "본인인증 후 재배송 요청"
        },
        cut3: {
          title:"본인 인증",
          blocks:[
            { h:"주민등록번호 입력", p:"안전한 우편물 수령을 위해 본인 확인을 진행합니다." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">이름</span><div class="fake-input">이름 입력</div></div><div class="fake-input-group"><span class="fake-label">주민등록번호 전체</span><div class="fake-input">****** - *******</div></div></div>` }
          ],
          quiz: {
            q: "재배송을 위해 주민등록번호 전체를 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["창을 닫고 우체국 공식 홈페이지에 직접 접속한다.", "스팸 문자로 판단하고 삭제한다."],
            bad: "[인증하기] 본인 확인을 위해 주민번호를 모두 입력한다."
          }
        },
        explain: [
          "🚨 피해 발생: 넘겨준 주민등록번호로 사기꾼이 대포폰을 개통하여 당신 명의로 범죄를 저지릅니다.",
          "우체국은 우편물 배송을 위해 주민등록번호 전체를 요구하지 않습니다."
        ]
      },
      { 
        id:"1C", text:"[로젠택배] 고객님의 문앞에 택배 배송 완료하였습니다. 배송 사진 확인하세요.", urlText:"http://photo-rozen-view.net/open",
        cut2: {
          title:"로젠택배 배송 사진", addr:"http://photo-rozen-view.net",
          blocks:[
            { html: `<div class="fake-blurred-bg">📦 배송 사진 로딩 중...</div>` },
            { h:"사진 뷰어 앱 설치", p:"고화질 배송 사진을 확인하려면 전용 뷰어 앱 설치가 필요합니다.\n\n[배송사진_뷰어.apk]" }
          ],
          trapBtn: "뷰어 앱 다운로드 및 설치"
        },
        cut3: {
          title:"앱 권한 허용 요구",
          blocks:[
            { h:"접근 권한 요청", p:"설치된 앱이 다음 권한을 요청합니다." },
            { html: `<div class="fake-form-box"><div>📞 전화 걸기 및 관리</div><div>✉️ SMS 메시지 전송 및 보기</div></div>` }
          ],
          quiz: {
            q: "사진을 보기 위한 앱이 기기 권한을 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["사진을 보는데 이런 권한은 필요 없으므로 창을 닫고 앱을 삭제한다.", "문자를 삭제하고 차단한다."],
            bad: "[허용] 권한을 주고 배송 사진을 확인한다."
          }
        },
        explain: [
          "🚨 피해 발생: 악성 앱 감염으로 기기의 모든 정보가 털렸고 스마트폰이 '좀비폰'이 되었습니다.",
          "택배 사진을 확인하기 위해 앱(.apk)을 설치하라는 것은 100% 스미싱입니다."
        ]
      }
    ]
  },
  {
    id: 2,
    title: { t1:"지인 경조사 사칭", t2:"- 청첩장·부고장 악성 앱 설치 유도" },
    theme: "iphone",
    messages: [
      { 
        id:"2A", text:"[모바일청첩장] 저희 두 사람의 결혼식에 초대합니다. 일시 및 장소 확인 부탁드려요.", urlText:"http://wedding-invitation-card.net",
        cut2: {
          title:"모바일 청첩장", addr:"http://wedding-invitation-card.net",
          blocks:[
            { html: `<div class="fake-blurred-bg">💐 웨딩 갤러리 로딩 중...</div>` },
            { h:"스마트 뷰어 설치 필요", p:"고화질 사진 및 약도를 정상적으로 보려면 보안 '스마트 뷰어' 앱 설치가 필요합니다." }
          ],
          trapBtn: "스마트 뷰어 앱 다운로드"
        },
        cut3: {
          title:"앱 권한 허용 요구",
          blocks:[
            { h:"접근 권한 요청", p:"설치된 [스마트 뷰어] 앱이 폰의 다음 권한을 요청합니다." },
            { html: `<div class="fake-form-box"><div>📞 전화 걸기 및 관리</div><div>✉️ SMS 메시지 전송 및 보기</div><div>📖 주소록 읽기 및 수정</div></div>` }
          ],
          quiz: {
            q: "청첩장 약도를 보기 위해 앱이 권한을 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["설치를 거부하고 즉시 인터넷 창을 닫는다.", "문자를 보낸 지인에게 직접 전화를 걸어 확인한다."],
            bad: "[설치 허용] 사진을 빨리 보기 위해 앱을 설치한다."
          }
        },
        explain: [
          "🚨 피해 발생: 지인의 폰이 해킹되어 문자가 온 것입니다. 앱을 설치한 순간 당신의 폰도 해킹되어 주소록 지인들에게 연쇄 피싱 문자가 발송됩니다.",
          "출처를 알 수 없는 앱(.apk)은 절대 설치하면 안 됩니다."
        ]
      },
      { 
        id:"2B", text:"[부고] 故 OOO님께서 별세하셨기에 삼가 알려드립니다. 장례식장 및 약도 안내", urlText:"http://bugo-notice-mobile.com",
        cut2: {
          title:"부고 알림", addr:"http://bugo-notice-mobile.com",
          blocks:[
            { html: `<div class="fake-blurred-bg">🕯️ 장례식장 약도 로딩 중...</div>` },
            { h:"장례식장 안내 앱 설치", p:"모바일 부고장 전용 안내 앱(Bugo_Info.apk)을 설치하셔야 약도 확인이 가능합니다." }
          ],
          trapBtn: "부고장 안내 앱 설치"
        },
        cut3: {
          title:"앱 권한 허용 요구",
          blocks:[
            { h:"기기 접근 권한", p:"원활한 앱 사용을 위해 아래 권한을 허용해 주세요." },
            { html: `<div class="fake-form-box"><div>🖼️ 사진 및 미디어 접근</div><div>📍 기기 위치 정보 엑세스</div></div>` }
          ],
          quiz: {
            q: "부고장 약도를 보기 위해 앱 설치 및 권한을 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["앱 설치를 거부하고, 지인이나 다른 참석자에게 전화를 걸어 물어본다.", "의심스러운 링크이므로 창을 닫는다."],
            bad: "[설치 허용] 장례식장에 가야 하니 무조건 앱을 설치한다."
          }
        },
        explain: [
          "🚨 피해 발생: 악성 앱이 설치되어 스마트폰 내의 사진, 금융 인증서 등 모든 개인 파일이 사기꾼의 서버로 복사되었습니다.",
          "경조사 문자에 포함된 링크는 누르기 전 반드시 본인에게 확인해야 합니다."
        ]
      },
      { 
        id:"2C", text:"[초대] 저희 아이의 첫돌을 축하해 주세요! 모바일 초대장 및 오시는 길", urlText:"http://first-birthday-party.net",
        cut2: {
          title:"돌잔치 초대장", addr:"http://first-birthday-party.net",
          blocks:[
            { html: `<div class="fake-blurred-bg">👶 아기 사진 로딩 중...</div>` },
            { h:"모바일 초대장 뷰어", p:"초대장 영상과 사진을 보시려면 전용 뷰어 설치가 필요합니다." }
          ],
          trapBtn: "뷰어 앱 설치하기"
        },
        cut3: {
          title:"원격 제어 권한 요구",
          blocks:[
            { h:"접근성 권한 요청", p:"설치된 [초대장 뷰어] 앱이 기기 제어 권한을 요청합니다." },
            { html: `<div class="fake-form-box"><div>⚠️ 기기 전체 제어 권한</div><div>⚠️ 화면 오버레이 (화면 녹화)</div></div>` }
          ],
          quiz: {
            q: "사진을 보기 위한 앱이 기기를 제어하는 과도한 권한을 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["사진을 보는데 이런 권한은 필요 없으므로 [거부]를 누른다.", "지인에게 확인 전화를 해본다."],
            bad: "[모두 허용] 권한을 주고 빨리 아기 사진을 본다."
          }
        },
        explain: [
          "🚨 피해 발생: 사기꾼에게 폰 제어 권한을 통째로 넘겨주었습니다. 폰 화면이 꺼져 있을 때 원격으로 은행 앱을 실행시켜 돈을 빼갑니다.",
          "안드로이드에서 '접근성(기기 제어)' 권한을 요구하는 앱은 매우 위험합니다."
        ]
      }
    ]
  },
  {
    id: 3,
    title: { t1:"허위 결제·구독 알림", t2:"- 콜백 및 계좌번호 탈취 유도" },
    theme: "galaxy",
    messages: [
      { 
        id:"3A", text:"[Web발신] [KG이니시스] 980,000원 결제 완료. 본인이 아닐 경우 취소 문의 바랍니다.", urlText:"http://pay-cancel-center.com",
        cut2: {
          title:"고객보호센터 (결제 취소)", addr:"http://pay-cancel-center.com",
          blocks:[
            { h:"결제 취소 절차", p:"명의도용 결제 취소를 위해 환불받으실 계좌 정보를 정확히 입력해 주세요." }
          ],
          trapBtn: "계좌 정보 입력 화면으로 이동"
        },
        cut3: {
          title:"환급 계좌 정보 입력",
          blocks:[
            { h:"계좌 인증", p:"결제 취소 대금을 환불받으실 본인 명의의 계좌 정보를 입력해 주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">환급 은행 및 계좌번호</span><div class="fake-input">계좌번호 입력</div></div><div class="fake-input-group"><span class="fake-label">계좌 비밀번호(4자리)</span><div class="fake-input">****</div></div></div>` }
          ],
          quiz: {
            q: "결제 취소를 명목으로 계좌 비밀번호를 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["창을 닫고, 내 신용카드 공식 앱을 켜서 실제 결제 내역을 확인한다.", "카드사 공식 대표번호로 직접 전화를 걸어 물어본다."],
            bad: "[입력 완료] 빨리 98만 원을 돌려받아야 하니 계좌 비밀번호를 입력한다."
          }
        },
        explain: [
          "🚨 피해 발생: 결제는 애초에 이루어지지 않았습니다. 방금 입력한 비밀번호로 사기꾼이 당신 통장의 진짜 돈을 모조리 인출했습니다.",
          "어떤 기관이나 카드사도 결제 취소를 위해 '계좌 비밀번호'를 묻지 않습니다."
        ]
      },
      { 
        id:"3B", text:"[해외결제] 아마존(Amazon) $850.00 승인 완료. 본인 요청이 아닐 시 즉시 연락 요망.", urlText:"http://amazon-auth-check.net",
        cut2: {
          title:"해외결제 이의신청", addr:"http://amazon-auth-check.net",
          blocks:[
            { h:"결제 이의신청 (본인확인)", p:"해외 부정 결제 취소를 위해 해당 카드의 소유자 확인 및 카드 정보 인증이 필요합니다." }
          ],
          trapBtn: "카드 정보 인증 진행"
        },
        cut3: {
          title:"신용카드 정보 입력",
          blocks:[
            { h:"인증 정보 입력", p:"안전한 결제 취소를 위해 아래 정보를 정확히 입력해 주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">카드번호 16자리</span><div class="fake-input">1234-****-****-****</div></div><div class="fake-input-group"><span class="fake-label">비밀번호 전체</span><div class="fake-input">****</div></div></div>` }
          ],
          quiz: {
            q: "부정 결제 취소를 위해 카드번호와 비밀번호 전체를 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["창을 닫고, 해당 카드사 고객센터에 직접 전화하여 정지 신청을 한다.", "피싱 문자임을 직감하고 삭제한다."],
            bad: "[입력 완료] 놀란 마음에 카드 정보를 전부 입력해 결제를 취소하려 한다."
          }
        },
        explain: [
          "🚨 피해 발생: 입력한 정보로 신용카드가 완벽하게 복제되어 당신의 카드로 진짜 해외 명품 결제가 발생해버렸습니다.",
          "카드 비밀번호 전체를 요구하는 곳은 100% 사기입니다."
        ]
      },
      { 
        id:"3C", text:"[구독안내] 넷플릭스 1년 프리미엄 170,000원 갱신 완료. 결제 취소:", urlText:"http://netflix-refund-kr.com",
        cut2: {
          title:"구독 서비스 고객센터", addr:"http://netflix-refund-kr.com",
          blocks:[
            { h:"환불 계좌 인증", p:"자동 갱신 취소 및 환불 처리를 위해 오픈뱅킹 연동 인증을 진행합니다." }
          ],
          trapBtn: "환불을 위한 인증 진행"
        },
        cut3: {
          title:"ARS 인증 진행",
          blocks:[
            { h:"본인 확인 절차", p:"아래 정보를 입력하고 수신되는 ARS 전화의 지시에 따라 인증번호를 눌러주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">은행 선택</span><div class="fake-input">은행을 선택하세요</div></div><div class="fake-input-group"><span class="fake-label">ARS 인증번호 입력</span><div class="fake-input">인증번호 6자리</div></div></div>` }
          ],
          quiz: {
            q: "환불을 명목으로 은행 ARS 인증을 진행하려 합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["넷플릭스 공식 앱이나 홈페이지에 들어가 구독 상태를 직접 확인한다.", "스미싱 링크이므로 무시하고 창을 닫는다."],
            bad: "[인증 완료] 환불을 위해 은행 ARS 전화를 받고 인증번호를 누른다."
          }
        },
        explain: [
          "🚨 피해 발생: ARS 인증은 환불이 아니라 사기꾼의 기기에 당신의 오픈뱅킹을 연동하는 인증이었습니다. 연결된 전 계좌가 털렸습니다.",
          "구독 서비스 환불을 위해 개인 계좌 ARS 연동을 요구하지 않습니다."
        ]
      }
    ]
  },
  {
    id: 4,
    title: { t1:"공공기관 환급금 사칭", t2:"- 정부24·건강보험 인증 탈취" },
    theme: "iphone",
    messages: [
      { 
        id:"4A", text:"[국민건강보험] 2026년 본인부담상한액 초과 의료비 환급금 신청 안내. 대상자 조회", urlText:"http://nhis-refund-kr.com",
        cut2: {
          title:"국민건강보험공단", addr:"http://nhis-refund-kr.com",
          blocks:[
            { h:"💰 미수령 환급금: 1,450,000원", p:"환급금을 귀속 전에 즉시 수령하시려면, 정부 공동인증서 로그인이 필요합니다." }
          ],
          trapBtn: "공동인증서로 인증하기"
        },
        cut3: {
          title:"정부 공동인증서 로그인",
          blocks:[
            { h:"본인 확인 절차", p:"안전한 환급을 위해 정부 공동인증서 비밀번호를 입력해 주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">주민등록번호 전체</span><div class="fake-input">****** - *******</div></div><div class="fake-input-group"><span class="fake-label">공동인증서 비밀번호</span><div class="fake-input">************</div></div></div>` }
          ],
          quiz: {
            q: "환급금을 준다며 공동인증서 비밀번호를 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["건강보험공단 1577-1000 번호로 직접 전화하여 사실을 확인한다.", "PC를 켜서 공식 홈페이지에 접속해 본다."],
            bad: "[인증 완료] 145만 원을 받기 위해 인증서 비밀번호를 입력한다."
          }
        },
        explain: [
          "🚨 피해 발생: 신분증 정보와 인증서 비밀번호가 털렸습니다. 사기꾼이 이 정보로 비대면 대출을 받아 수천만 원의 빚이 생겼습니다.",
          "국가 기관은 문자 메시지 링크를 통해 인증서 비밀번호를 절대로 요구하지 않습니다."
        ]
      },
      { 
        id:"4B", text:"[고용노동부] 민생안정지원금 소상공인 특별 지원 300만 원 신청이 내일 마감됩니다.", urlText:"http://gov-support-kr.com",
        cut2: {
          title:"소상공인 지원센터", addr:"http://gov-support-kr.com",
          blocks:[
            { h:"지원금 신청 (계좌 등록)", p:"300만 원 지원금을 입금받으실 사업자 명의의 계좌 및 보안매체(OTP/보안카드) 번호를 입력하세요." }
          ],
          trapBtn: "지원금 입금 계좌 등록"
        },
        cut3: {
          title:"보안 정보 입력",
          blocks:[
            { h:"계좌 보안 인증", p:"본인 명의 계좌 확인을 위해 보안카드 정보를 입력해 주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">계좌 비밀번호</span><div class="fake-input">****</div></div><div class="fake-input-group"><span class="fake-label">OTP / 보안카드 번호</span><div class="fake-input">보안번호 입력</div></div></div>` }
          ],
          quiz: {
            q: "지원금 입금을 명목으로 계좌 비밀번호와 OTP 번호를 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["정부 기관은 링크로 OTP 번호를 묻지 않으므로 즉시 창을 닫는다.", "관할 구청이나 부처에 직접 문의한다."],
            bad: "[입력 완료] 300만 원을 놓칠 수 없으니 보안카드 번호를 입력한다."
          }
        },
        explain: [
          "🚨 피해 발생: OTP 번호를 넘겨주는 순간 당신의 통장은 사기꾼의 손에 넘어갔습니다. 모든 잔고가 다른 계좌로 이체되었습니다.",
          "어떠한 경우에도 보안카드나 OTP 번호 전체를 입력하라는 곳은 100% 사기입니다."
        ]
      },
      { 
        id:"4C", text:"[국세청] 종합소득세 미수령 환급금이 발생했습니다. 오늘까지 국고 귀속 예정.", urlText:"http://hometax-refund-kr.com",
        cut2: {
          title:"국세청 홈택스 (모바일)", addr:"http://hometax-refund-kr.com",
          blocks:[
            { h:"종합소득세 환급 조회", p:"본인 명의 휴대전화 인증 및 신분증(주민등록증/운전면허증) 발급일자 입력이 필요합니다." }
          ],
          trapBtn: "본인 인증 후 환급금 조회"
        },
        cut3: {
          title:"신분증 진위 확인",
          blocks:[
            { h:"정보 입력란", p:"정확한 환급 처리를 위해 발급일자를 입력해 주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">신분증 발급일자</span><div class="fake-input">YYYY-MM-DD</div></div><div class="fake-input-group"><span class="fake-label">통신사 인증번호</span><div class="fake-input">6자리 숫자</div></div></div>` }
          ],
          quiz: {
            q: "환급을 위해 신분증 발급일자와 휴대전화 인증번호를 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["PC로 국세청 홈택스에 접속하여 진짜 환급금이 있는지 확인한다.", "문자를 삭제하고 스팸 신고를 한다."],
            bad: "[인증 완료] 환급금을 받기 위해 시키는 대로 모두 입력한다."
          }
        },
        explain: [
          "🚨 피해 발생: 사기꾼이 당신의 신분증 발급일자 정보로 신분증 진위확인을 통과하여 알뜰폰을 개통하고 사기를 칩니다.",
          "신분증 발급일자는 매우 중요한 인증 수단이므로 절대 함부로 입력해선 안 됩니다."
        ]
      }
    ]
  },
  {
    id: 5,
    title: { t1:"과태료·민원 사칭", t2:"- 신호위반·쓰레기 원격앱 설치" },
    theme: "galaxy",
    messages: [
      { 
        id:"5A", text:"[경찰청 교통민원24] 도로교통법 위반(신호위반) 과태료 고지서 발송. 내역 조회", urlText:"http://efine-go-kr.com",
        cut2: {
          title:"경찰청 이파인", addr:"http://efine-go-kr.com",
          blocks:[
            { h:"과태료 고지 (블랙박스 확인)", p:"위반 장소: 서울 시내 사거리\n⚠️ 개인정보 보호를 위해 [교통민원 보안앱]을 설치해야만 단속 영상을 확인할 수 있습니다." }
          ],
          trapBtn: "모바일 보안앱 다운로드"
        },
        cut3: {
          title:"파일 다운로드 경고",
          blocks:[
            { h:"출처를 알 수 없는 앱", p:"이 파일을 설치하시겠습니까?\n[ eFine_Viewer.apk ]" },
            { html: `<div class="fake-form-box"><div style="text-align:center; color:#dc2626; font-weight:900;">⚠️ 이 파일은 기기를 손상시킬 수 있습니다.</div></div>` }
          ],
          quiz: {
            q: "단속 영상을 보기 위해 출처가 불분명한 파일(.apk) 다운로드를 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["플레이스토어에서 진짜 '교통민원24' 앱을 검색해서 설치 후 조회해 본다.", "무시하고 인터넷 창을 닫는다."],
            bad: "[설치 무시하고 다운로드] 내가 위반했는지 블랙박스 영상을 확인한다."
          }
        },
        explain: [
          "🚨 피해 발생: 경찰청 앱을 가장한 악성코드에 감염되었습니다. 폰의 모든 통화 기록과 문자가 사기꾼에게 넘어갑니다.",
          "과태료 조회를 위해 공식 마켓이 아닌 외부 링크에서 다운로드하는 앱은 100% 사기입니다."
        ]
      },
      { 
        id:"5B", text:"[구청 민원실] 폐기물 관리법 위반(무단투기) 신고가 접수되었습니다. 증거 확인", urlText:"http://minwon-photo-check.com",
        cut2: {
          title:"구청 민원24", addr:"http://minwon-photo-check.com",
          blocks:[
            { h:"신고 접수 내역", p:"귀하의 폐기물 무단투기 현장 사진이 신고되었습니다.\n아래 민원 뷰어 앱을 통해 증거 사진을 확인하세요." }
          ],
          trapBtn: "증거 사진 뷰어 앱 설치"
        },
        cut3: {
          title:"앱 권한 설정",
          blocks:[
            { h:"필수 권한 동의", p:"앱 실행을 위해 아래 권한을 모두 허용해 주세요." },
            { html: `<div class="fake-form-box"><div>📸 카메라 및 마이크 접근</div><div>📂 파일 및 미디어 읽기</div></div>` }
          ],
          quiz: {
            q: "민원 증거 사진을 보기 위해 과도한 기기 권한을 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["사진 보는데 앱 권한을 요구하는 공공기관은 없으므로 즉시 닫는다.", "관할 구청에 전화하여 과태료 내역을 물어본다."],
            bad: "[권한 허용] 쓰레기를 버린 적이 없으니 억울해서 증거를 확인한다."
          }
        },
        explain: [
          "🚨 피해 발생: 악성 앱이 카메라와 마이크 권한을 탈취하여 당신의 일상을 엿듣고 불법 촬영하여 협박에 사용합니다.",
          "단순한 사진 확인을 위해 앱을 깔라는 것은 보이스피싱의 첫 단계입니다."
        ]
      },
      { 
        id:"5C", text:"[안전신문고] 귀하의 자택 관련 층간소음 민원이 접수되었습니다. 현장 녹음 확인", urlText:"http://safety-report-korea.net",
        cut2: {
          title:"안전신문고", addr:"http://safety-report-korea.net",
          blocks:[
            { h:"층간소음 증거 확인", p:"현장 녹음 파일을 재생하려면 폰 설정에서 앱의 '접근성(기기 제어)' 권한을 반드시 켜야 합니다." }
          ],
          trapBtn: "접근성 권한 설정 열기"
        },
        cut3: {
          title:"안드로이드 접근성 권한 요구",
          blocks:[
            { h:"기기 전체 제어 동의", p:"이 기능(앱)이 기기를 완전히 제어할 수 있도록 허용하시겠습니까?" },
            { html: `<div class="fake-form-box"><div>⚠️ 기기 전체 화면 제어 (허용 필요)</div><div>⚠️ 키보드 입력 정보 수집 (허용 필요)</div></div>` }
          ],
          quiz: {
            q: "녹음을 듣기 위해 폰 전체를 제어하는 '접근성' 권한을 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["[거부]를 누르고 설치된 앱을 즉시 삭제한다.", "악성 스미싱 문자이므로 무시한다."],
            bad: "[권한 허용] 민원 내용이 궁금하니 권한을 허용하고 재생한다."
          }
        },
        explain: [
          "🚨 피해 발생: 접근성 권한을 넘겨주자, 사기꾼이 원격으로 폰 화면을 끄고 당신의 은행 앱을 실행시켜 돈을 모두 빼갔습니다.",
          "안드로이드에서 '접근성(기기 제어)' 권한을 허용하면 폰의 주인이 사기꾼으로 바뀌게 됩니다."
        ]
      }
    ]
  },
  {
    id: 6,
    title: { t1:"일상생활·주차 사칭", t2:"- 불법주차·접촉사고 포털 계정 탈취" },
    theme: "iphone",
    messages: [
      { 
        id:"6A", text:"[교통안전공단] 귀하의 차량이 불법주차로 견인 조치될 예정입니다. (사진 첨부)", urlText:"http://car-move-notice.com",
        cut2: {
          title:"교통안전공단 (견인 조회)", addr:"http://car-move-notice.com",
          blocks:[
            { h:"안전한 사진 확인 (네이버 연동)", p:"견인 대상 차량의 번호판과 현장 사진을 보시려면 본인 확인을 위해 포털 계정 로그인이 필요합니다." }
          ],
          trapBtn: "네이버 아이디로 안전하게 로그인"
        },
        cut3: {
          title:"네이버 로그인",
          blocks:[
            { h:"계정 연동", p:"사진 조회를 위해 네이버 아이디와 비밀번호를 입력해 주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">네이버 아이디</span><div class="fake-input">아이디 입력</div></div><div class="fake-input-group"><span class="fake-label">비밀번호</span><div class="fake-input">비밀번호 입력</div></div></div>` }
          ],
          quiz: {
            q: "차량 사진을 보기 위해 포털 사이트 아이디와 비밀번호를 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["창을 닫고, 차가 잘 주차되어 있는지 직접 가서 눈으로 확인한다.", "URL 주소가 진짜 네이버가 맞는지 확인하고 의심한다."],
            bad: "[로그인] 당황해서 빨리 사진을 보려고 아이디와 비밀번호를 친다."
          }
        },
        explain: [
          "🚨 피해 발생: 사진은 애초에 없었습니다. 방금 입력한 포털 계정과 비밀번호가 사기꾼의 서버로 고스란히 전송되었습니다.",
          "단순한 조회를 위해 네이버 로그인을 요구하는 화면은 주소창의 URL을 반드시 확인해야 합니다."
        ]
      },
      { 
        id:"6B", text:"차 빼다가 살짝 긁었는데 전화 안 받으셔서 문자 남깁니다. 파손 사진:", urlText:"http://my-car-photo-view.net",
        cut2: {
          title:"블랙박스 클라우드", addr:"http://my-car-photo-view.net",
          blocks:[
            { h:"클라우드 사진 열람 (카카오 연동)", p:"상대방이 공유한 파손 사진과 영상을 보려면 카카오 계정 로그인이 필요합니다." }
          ],
          trapBtn: "카카오 계정으로 열람하기"
        },
        cut3: {
          title:"카카오 로그인",
          blocks:[
            { h:"본인 확인", p:"안전한 열람을 위해 카카오 계정 정보를 입력해 주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">카카오 메일 아이디</span><div class="fake-input">이메일 입력</div></div><div class="fake-input-group"><span class="fake-label">카카오 비밀번호</span><div class="fake-input">비밀번호 입력</div></div></div>` }
          ],
          quiz: {
            q: "파손 사진을 보는데 뜬금없이 카카오 계정 로그인을 요구합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["링크를 누르지 않고, 문자를 보낸 번호로 직접 전화를 걸어본다.", "창을 닫고 차에 가서 긁힌 곳이 있는지 확인한다."],
            bad: "[로그인] 빨리 긁힌 부위를 확인하기 위해 카카오 계정으로 로그인한다."
          }
        },
        explain: [
          "🚨 피해 발생: 털린 카카오 계정으로 사기꾼이 로그인하여, 당신 행세를 하며 카톡 지인들에게 돈을 빌려달라고 2차 피싱을 시도합니다.",
          "모르는 사람이 보낸 문자의 링크는 절대 누르지 마세요."
        ]
      },
      { 
        id:"6C", text:"[카카오T] 예약하신 콜택시 기사 배정이 완료되었습니다. 기사 정보 확인", urlText:"http://kakao-t-loc.com",
        cut2: {
          title:"카카오모빌리티 배차 안내", addr:"http://kakao-t-loc.com",
          blocks:[
            { h:"실시간 위치 확인", p:"배정된 기사의 실시간 위치와 차량 번호를 확인하시려면 카카오 로그인을 진행해 주세요." }
          ],
          trapBtn: "카카오 로그인 후 기사 확인"
        },
        cut3: {
          title:"카카오톡 인증",
          blocks:[
            { h:"보안 인증 절차", p:"계정 보호를 위해 카카오톡 이메일과 비밀번호를 입력해 주세요." },
            { html: `<div class="fake-form-box"><div class="fake-input-group"><span class="fake-label">카카오 메일 아이디</span><div class="fake-input">이메일 입력</div></div><div class="fake-input-group"><span class="fake-label">카카오 비밀번호</span><div class="fake-input">비밀번호 입력</div></div></div>` }
          ],
          quiz: {
            q: "택시를 부르지도 않았는데 배차 확인을 위해 로그인을 유도합니다. 어떻게 하시겠습니까?", desc: "진행 여부를 신중히 선택해 주세요.",
            ok: ["주소가 진짜 카카오 공식 도메인인지 확인하고 즉시 창을 닫는다.", "택시를 부른 적이 없으므로 문자를 삭제하고 무시한다."],
            bad: "[로그인] 누군가 내 아이디로 택시를 불렀는지 확인하려고 로그인해본다."
          }
        },
        explain: [
          "🚨 피해 발생: 계정을 탈취한 사기꾼이 카카오페이에 연동된 카드로 모바일 상품권을 대량 결제하여 빼돌렸습니다.",
          "일상생활 서비스 사칭 문자는 익숙함을 무기로 방심을 유도하므로 각별한 주의가 필요합니다."
        ]
      }
    ]
  }
];