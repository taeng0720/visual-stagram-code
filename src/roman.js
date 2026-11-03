const roman = (() => {
  const LEADS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
  const VOWELS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
  const TAILS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
  const VOWEL_PAIRS = { ㅗㅏ: 'ㅘ', ㅗㅐ: 'ㅙ', ㅗㅣ: 'ㅚ', ㅜㅓ: 'ㅝ', ㅜㅔ: 'ㅞ', ㅜㅣ: 'ㅟ', ㅡㅣ: 'ㅢ' }
  const TAIL_PAIRS = { ㄱㅅ: 'ㄳ', ㄴㅈ: 'ㄵ', ㄴㅎ: 'ㄶ', ㄹㄱ: 'ㄺ', ㄹㅁ: 'ㄻ', ㄹㅂ: 'ㄼ', ㄹㅅ: 'ㄽ', ㄹㅌ: 'ㄾ', ㄹㅍ: 'ㄿ', ㄹㅎ: 'ㅀ', ㅂㅅ: 'ㅄ' }

  const INITIAL = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
  const MEDIAL = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
  const SOUND = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't']
  const LIAISON = [null, ['', 'g'], ['', 'kk'], ['k', 's'], ['', 'n'], ['n', 'j'], ['', 'n'], ['', 'd'], ['', 'r'], ['l', 'g'], ['l', 'm'], ['l', 'b'], ['l', 's'], ['l', 't'], ['l', 'p'], ['', 'r'], ['', 'm'], ['', 'b'], ['p', 's'], ['', 's'], ['', 'ss'], ['ng', ''], ['', 'j'], ['', 'ch'], ['', 'k'], ['', 't'], ['', 'p'], ['', '']]
  const LONE = { ㄱ: 'g', ㄲ: 'kk', ㄴ: 'n', ㄷ: 'd', ㄸ: 'tt', ㄹ: 'r', ㅁ: 'm', ㅂ: 'b', ㅃ: 'pp', ㅅ: 's', ㅆ: 'ss', ㅇ: 'ng', ㅈ: 'j', ㅉ: 'jj', ㅊ: 'ch', ㅋ: 'k', ㅌ: 't', ㅍ: 'p', ㅎ: 'h' }
  ;[...VOWELS].forEach((v, i) => (LONE[v] = MEDIAL[i]))

  const SURNAME = {
    김: 'kim', 이: 'lee', 박: 'park', 최: 'choi', 정: 'jung', 강: 'kang', 조: 'cho', 윤: 'yoon', 장: 'jang', 임: 'lim',
    한: 'han', 오: 'oh', 서: 'seo', 신: 'shin', 권: 'kwon', 황: 'hwang', 안: 'ahn', 송: 'song', 류: 'ryu', 유: 'yoo',
    전: 'jeon', 홍: 'hong', 고: 'ko', 문: 'moon', 양: 'yang', 손: 'son', 배: 'bae', 백: 'baek', 허: 'heo', 노: 'noh',
    남: 'nam', 심: 'shim', 하: 'ha', 곽: 'kwak', 성: 'sung', 차: 'cha', 주: 'joo', 우: 'woo', 구: 'koo', 민: 'min',
    나: 'na', 진: 'jin', 지: 'ji', 엄: 'eom', 채: 'chae', 원: 'won', 천: 'cheon', 방: 'bang', 공: 'kong', 현: 'hyun',
    함: 'ham', 변: 'byun', 염: 'yeom', 여: 'yeo', 추: 'choo', 도: 'do', 소: 'so', 석: 'seok', 선: 'sun', 설: 'seol',
    마: 'ma', 길: 'gil', 연: 'yeon', 위: 'wi', 표: 'pyo', 명: 'myung', 기: 'ki', 반: 'ban', 왕: 'wang', 금: 'keum',
    옥: 'ok', 육: 'yuk', 인: 'in', 맹: 'maeng', 제: 'je', 모: 'mo', 탁: 'tak', 국: 'kook', 은: 'eun', 용: 'yong',
    봉: 'bong', 피: 'pi', 편: 'pyeon', 예: 'ye', 경: 'kyung', 태: 'tae', 감: 'kam', 황보: 'hwangbo', 남궁: 'namgung', 제갈: 'jegal', 선우: 'sunwoo', 독고: 'dokgo', 사공: 'sagong',
  }
  const GIVEN = {
    영: 'young', 정: 'jung', 성: 'sung', 현: 'hyun', 혁: 'hyuk', 윤: 'yoon', 우: 'woo', 주: 'joo', 경: 'kyung', 형: 'hyung',
    병: 'byung', 명: 'myung', 훈: 'hoon', 철: 'chul', 희: 'hee', 석: 'seok', 숙: 'sook', 순: 'soon', 균: 'kyun', 규: 'kyu',
    근: 'geun', 원: 'won', 효: 'hyo', 승: 'seung', 은: 'eun', 진: 'jin', 준: 'jun', 범: 'beom', 결: 'gyeol', 기: 'ki',
    구: 'koo', 국: 'kook', 균: 'gyun', 겸: 'gyeom', 길: 'gil', 녕: 'nyeong', 령: 'ryeong', 률: 'ryul', 율: 'yul', 욱: 'wook',
    웅: 'woong', 종: 'jong', 중: 'joong', 충: 'choong', 홍: 'hong', 환: 'hwan', 휘: 'hwi', 흥: 'heung', 강: 'kang', 광: 'kwang',
  }
  const SUFFIX = new Set(['이', '네', '야', '아', '씨', '님'])

  const WORDS = {
    가족: 'family', 우리가족: 'our family', 친구: 'friend', 친구들: 'friends', 베프: 'best friend', 절친: 'best friend', 엄마: 'mom', 어머니: 'mother', 아빠: 'dad', 아버지: 'father',
    형: 'bro', 오빠: 'bro', 누나: 'sis', 언니: 'sis', 동생: 'sibling', 남동생: 'brother', 여동생: 'sister', 할머니: 'grandma', 할아버지: 'grandpa', 이모: 'aunt', 고모: 'aunt', 삼촌: 'uncle', 사촌: 'cousin',
    남친: 'boyfriend', 여친: 'girlfriend', 남자친구: 'boyfriend', 여자친구: 'girlfriend', 전남친: 'ex boyfriend', 전여친: 'ex girlfriend', 애인: 'lover', 자기: 'honey', 여보: 'honey', 남편: 'husband', 아내: 'wife', 와이프: 'wife',
    선배: 'senior', 후배: 'junior', 동기: 'peers', 동창: 'alumni', 룸메: 'roommate', 룸메이트: 'roommate', 이웃: 'neighbor', 선생님: 'teacher', 쌤: 'teacher', 교수님: 'professor', 교수: 'professor', 사장님: 'boss', 팀장님: 'team lead', 부장님: 'manager',
    학교: 'school', 대학: 'college', 대학교: 'university', 고등학교: 'high school', 중학교: 'middle school', 초등학교: 'elementary', 학과: 'department', 전공: 'major', 학생: 'student', 학생회: 'student council', 졸업: 'graduation',
    회사: 'company', 직장: 'work', 동료: 'coworker', 팀: 'team', 팀플: 'team project', 회의: 'meeting', 업무: 'work', 공지: 'notice', 공지방: 'notices', 공부: 'study', 스터디: 'study', 시험: 'exam', 과제: 'homework', 수업: 'class', 반: 'class',
    모임: 'meetup', 동아리: 'club', 클럽: 'club', 팬클럽: 'fanclub', 팬: 'fan', 그룹: 'group', 단톡: 'group chat', 단톡방: 'group chat', 톡방: 'chat', 채팅: 'chat', 방: 'room', 멤버: 'member', 크루: 'crew', 밴드: 'band',
    여행: 'trip', 여행방: 'trip', 맛집: 'food spots', 밥: 'meal', 점심: 'lunch', 저녁: 'dinner', 술: 'drinks', 술친구: 'drinking buddies', 커피: 'coffee', 카페: 'cafe', 치킨: 'chicken', 피자: 'pizza', 배고파: 'hungry', 배고픔: 'hungry',
    운동: 'workout', 헬스: 'gym', 축구: 'soccer', 농구: 'basketball', 야구: 'baseball', 배구: 'volleyball', 테니스: 'tennis', 골프: 'golf', 러닝: 'running', 등산: 'hiking', 수영: 'swimming', 게임: 'game', 게임방: 'gaming', 롤: 'lol', 럼블: 'rumble',
    음악: 'music', 영화: 'movie', 사진: 'photos', 일상: 'daily', 기록: 'log', 비밀: 'secret', 공식: 'official', 계정: 'account', 부계: 'alt', 본계: 'main', 사용자: 'user', 관리자: 'admin', 운영자: 'admin', 알바: 'part time', 쇼핑: 'shopping',
    개발: 'dev', 개발자: 'developer', 개발자들: 'developers', 디자인: 'design', 디자이너: 'designer', 코딩: 'coding', 프로젝트: 'project', 마케팅: 'marketing', 커뮤니티: 'community', 스타트업: 'startup', 창업: 'startup', 투자: 'invest', 주식: 'stocks', 코인: 'crypto',
    사랑: 'love', 행복: 'happy', 고양이: 'cat', 강아지: 'puppy', 댕댕이: 'puppy', 냥이: 'kitty', 바다: 'sea', 하늘: 'sky', 별: 'star', 달: 'moon', 꽃: 'flower', 부자: 'rich', 부잣집: 'rich family', 여자: 'woman', 남자: 'man', 여자들: 'women', 남자들: 'men',
    무직: 'jobless', 백수: 'jobless', 무직개백수: 'jobless', 사이: 'between', 사이에: 'between', 셋: 'three', 둘: 'two', 넷: 'four', 모두: 'everyone', 모두의: 'everyones', 우리: 'our', 우리들: 'us', 전: 'ex', 새: 'new', 진짜: 'real', 최고: 'best', 바보: 'fool',
    인스타: 'insta', 인스타그램: 'instagram', 유튜브: 'youtube', 카톡: 'kakaotalk', 디스코드: 'discord', 페이스북: 'facebook', 트위터: 'twitter', 틱톡: 'tiktok', 넷플릭스: 'netflix',
  }
  const LONGEST = Math.max(...Object.keys(WORDS).map((w) => w.length))

  const hangul = (c) => c >= '가' && c <= '힣'
  const parts = (c) => {
    const n = c.charCodeAt(0) - 0xac00
    return [Math.floor(n / 588), Math.floor((n % 588) / 28), n % 28]
  }
  const syllable = (lead, vowel, tail = '') => String.fromCharCode(0xac00 + LEADS.indexOf(lead) * 588 + VOWELS.indexOf(vowel) * 28 + TAILS.indexOf(tail))

  const compose = (text) => {
    const s = [...text.normalize('NFC')]
    const lead = (c) => LEADS.includes(c)
    const vowel = (c) => VOWELS.includes(c)
    let out = ''
    for (let i = 0; i < s.length; ) {
      if (!lead(s[i]) || !vowel(s[i + 1])) {
        out += s[i++]
        continue
      }
      const l = s[i]
      let v = s[i + 1]
      i += 2
      if (VOWEL_PAIRS[v + s[i]]) v = VOWEL_PAIRS[v + s[i++]]
      let t = ''
      if (TAILS.includes(s[i]) && !vowel(s[i + 1])) {
        t = s[i++]
        if (TAIL_PAIRS[t + s[i]] && !vowel(s[i + 1])) t = TAIL_PAIRS[t + s[i++]]
      }
      out += syllable(l, v, t)
    }
    return out
  }

  const spell = (word) => {
    const s = [...word]
    let out = ''
    for (let k = 0; k < s.length; k++) {
      if (!hangul(s[k])) {
        out += LONE[s[k]] ?? s[k]
        continue
      }
      const [, m, f] = parts(s[k])
      const before = k && hangul(s[k - 1]) ? parts(s[k - 1])[2] : 0
      let init = INITIAL[parts(s[k])[0]]
      if (before) init = joined(before, parts(s[k])[0])[1] ?? init
      const next = hangul(s[k + 1]) ? parts(s[k + 1])[0] : -1
      const fin = f ? (next >= 0 ? joined(f, next)[0] : SOUND[f]) : ''
      out += init + MEDIAL[m] + fin
    }
    return out
  }

  const joined = (f, n) => {
    const sound = SOUND[f]
    if (n === 11) return LIAISON[f]
    const h = f === 6 || f === 15 || f === 27
    if (h && (n === 0 || n === 3 || n === 12)) return [f === 6 ? 'n' : f === 15 ? 'l' : '', { 0: 'k', 3: 't', 12: 'ch' }[n]]
    const nasal = n === 2 || n === 6
    const liquid = n === 5
    if (sound === 'k' && (nasal || liquid)) return ['ng', liquid ? 'n' : undefined]
    if (sound === 't' && (nasal || liquid)) return ['n', liquid ? 'n' : undefined]
    if (sound === 'p' && (nasal || liquid)) return ['m', liquid ? 'n' : undefined]
    if (sound === 'n' && liquid) return ['l', 'l']
    if (sound === 'l' && (n === 2 || liquid)) return ['l', 'l']
    if ((sound === 'm' || sound === 'ng') && liquid) return [sound, 'n']
    return [sound, undefined]
  }

  const given = (text) => [...text].map((c) => GIVEN[c] ?? spell(c)).join('')

  let guessed = false
  const segment = (chunk) => {
    const out = []
    let rest = ''
    const flush = () => rest && (out.push(spell(rest)), (rest = ''), (guessed = true))
    for (let i = 0; i < chunk.length; ) {
      let hit = null
      for (let len = Math.min(LONGEST, chunk.length - i); len >= 2 && !hit; len--) if (WORDS[chunk.slice(i, i + len)]) hit = chunk.slice(i, i + len)
      if (hit) {
        flush()
        out.push(...WORDS[hit].split(' '))
        i += hit.length
      } else rest += chunk[i++]
    }
    flush()
    return out
  }

  const DICTIONARY = new Set(Object.values(WORDS).flatMap((w) => w.split(' ')))
  const looksLikeName = (chunk) => {
    if (![...chunk].every(hangul) || chunk.length < 2 || !(chunk.length <= 3 || (chunk.length === 4 && SURNAME[chunk.slice(0, 2)])) || WORDS[chunk]) return false
    const was = guessed
    const known = segment(chunk).some((w) => DICTIONARY.has(w))
    guessed = was
    return !known
  }

  const words = (text) => {
    const chunks = compose(text)
      .split(/[^0-9A-Za-zÀ-ɏ가-힣ㄱ-ㅣ]+/)
      .map((c) => (c.length > 1 && /[님씨]$/.test(c) ? c.slice(0, -1) : c))
      .filter((c) => c && c !== '님' && c !== '씨')
    if (!chunks.length) return []
    const [first, second] = chunks
    if (chunks.length === 2 && SURNAME[first] && [...second].every(hangul) && second.length <= 2 && !WORDS[second]) return [SURNAME[first], given(second)]
    return chunks.flatMap((chunk, i) => {
      if (!/[가-힣ㄱ-ㅣ]/.test(chunk)) return [chunk.normalize('NFD').replace(/[̀-ͯ]/g, '')]
      if (/[ㄱ-ㅣ]/.test(chunk)) guessed = true
      if (WORDS[chunk]) return WORDS[chunk].split(' ')
      if (looksLikeName(chunk)) {
        const two = SURNAME[chunk.slice(0, 2)]
        if (chunk.length >= 3 && two) return [two, given(chunk.slice(2))]
        if (chunk.length === 3 && SURNAME[chunk[0]] && !SUFFIX.has(chunk[2]) && !i) return [SURNAME[chunk[0]], given(chunk.slice(1))]
        return [given(chunk)]
      }
      return segment(chunk)
    })
  }

  const convert = (text, limit = 4) => {
    guessed = false
    const all = words(text)
      .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(Boolean)
    return { words: all.slice(0, limit), clean: all.length > 0 && all.length <= limit && !guessed }
  }

  return { compose, spell, convert, words: (text, limit) => convert(text, limit).words }
})()

if (typeof module !== 'undefined') module.exports = roman

if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert')
  const say = (text) => roman.words(text).join('_')
  assert.strictEqual(roman.compose('ㄱㅜㅓㄴ ㅌㅐㅇㅜ'), '권 태우')
  assert.strictEqual(roman.compose('ㅎㅏㄴㄱㅡㄹ'), '한글')
  assert.strictEqual(roman.compose('ㄷㅏㄹㄱ'), '닭')
  assert.strictEqual(roman.compose('ㅋㅋ'), 'ㅋㅋ')

  assert.strictEqual(roman.spell('클럽'), 'keulleop')
  assert.strictEqual(roman.spell('신라'), 'silla')
  assert.strictEqual(roman.spell('국물'), 'gungmul')
  assert.strictEqual(roman.spell('부잣집'), 'bujatjip')
  assert.strictEqual(roman.spell('먹어'), 'meogeo')
  assert.strictEqual(roman.spell('좋고'), 'joko')
  assert.strictEqual(roman.spell('촌놈'), 'chonnom')

  assert.strictEqual(say('김민수'), 'kim_minsu')
  assert.strictEqual(say('김민재님'), 'kim_minjae')
  assert.strictEqual(say('이지영'), 'lee_jiyoung')
  assert.strictEqual(say('김동영님'), 'kim_dongyoung')
  assert.strictEqual(say('한성민님'), 'han_sungmin')
  assert.strictEqual(say('김승훈님'), 'kim_seunghoon')
  assert.strictEqual(say('김진현님'), 'kim_jinhyun')
  assert.strictEqual(say('최은수'), 'choi_eunsu')
  assert.strictEqual(say('김강민님'), 'kim_kangmin')
  assert.strictEqual(say('남궁민수'), 'namgung_minsu')
  assert.strictEqual(say('ㄱㅜㅓㄴ ㅌㅐㅇㅜ'), 'kwon_taewoo')
  assert.strictEqual(say('한결님'), 'hangyeol')
  assert.strictEqual(say('수호님'), 'suho')
  assert.strictEqual(say('승린님'), 'seungrin')
  assert.strictEqual(say('민재네'), 'minjaene')
  assert.strictEqual(say('예림이 전남친'), 'yerimi_ex_boyfriend')
  assert.strictEqual(say('배고파'), 'hungry')
  assert.strictEqual(say('바다촌놈'), 'sea_chonnom')
  assert.strictEqual(say('윙탄지팬클럽'), 'wingtanji_fanclub')
  assert.strictEqual(say('모두의 럼블'), 'everyones_rumble')
  assert.strictEqual(say('Instagram 사용자님'), 'instagram_user')
  assert.strictEqual(say('개발자 셋 사이에 낀 무직개백수'), 'developer_three_between_kkin')
  assert.strictEqual(say('우리 가족 ❤️'), 'our_family')
  assert.strictEqual(say('y.0n_____님'), 'y_0n')
  assert.strictEqual(say('José Kim'), 'jose_kim')
  assert.strictEqual(say('ㅋㅍㅇV26'), 'kpngv26')
  assert.strictEqual(say('🍀'), '')

  const clean = (text) => roman.convert(text).clean
  for (const ok of ['김민수', '주은찬님', '한결님', '모두의 럼블', 'Instagram 사용자님', '배고파', '우리 가족', 'ㄱㅜㅓㄴ ㅌㅐㅇㅜ', '예림이 전남친', 'y.0n_____님']) assert(clean(ok), `clean: ${ok}`)
  for (const bad of ['바다촌놈', '윙탄지팬클럽', 'ㅋㅍㅇV26', '🍀', '개발자 셋 사이에 낀 무직개백수', '부잣집,여자갈아타는,남자많은,중학교때 술담배한 티라노 진홍']) assert(!clean(bad), `not clean: ${bad}`)
  console.log('ok')
}
