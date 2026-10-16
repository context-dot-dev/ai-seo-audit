/**
 * Multilingual GEO rule patterns.
 *
 * English heuristics (e.g. "according to", "is defined as", ASCII "?") do not
 * fire on Chinese/Japanese/Korean content. This module provides language-
 * specific regex dictionaries so every rule can apply the right patterns for
 * the detected language.
 */
export type Language = "en" | "zh" | "ja" | "ko" | "unknown";

export interface LanguagePatterns {
  /** Verbs / assertion phrases for BLUF-intro detection (B1). */
  blufVerbs: RegExp;
  /** Full-width and/or ASCII question marks (B5, FAQ detection). */
  questionMark: RegExp;
  /** FAQ-label keywords (B5, computeFaqStatus). */
  faqKeywords: RegExp;
  /** Source-attribution phrases like "according to" (B7). */
  sourceAttribution: RegExp;
  /** Definitional sentence patterns like "is defined as" (B10). */
  definitional: RegExp;
  /** Research / original-data language (D10). */
  researchLanguage: RegExp;
  /** Byline / author attribution (detectByline in audit.ts). */
  bylinePattern: RegExp;
  /** Commercial / SaaS / product keywords (isCommercialOfferingLike). */
  commercialKeywords: RegExp;
  /** Developer / technical product keywords (isTechnicalProductLike). */
  technicalKeywords: RegExp;
  /** "last updated" / "最后更新" visible modified-date signals. */
  visibleModifiedPattern: RegExp;
  /** Locale-specific date format, e.g. 2024年1月15日. null if N/A. */
  datePattern: RegExp | null;
}

// ---------------------------------------------------------------------------
// Language detection
// ---------------------------------------------------------------------------

/**
 * Detect the dominant language from page text using Unicode range heuristics.
 * Checks Japanese first (kana), then Korean (hangul), then Chinese (CJK
 * ideographs), falling back to English.
 *
 * Requires at least 15 CJK/kana/hangul characters (or 5 % of total text,
 * whichever is smaller) to flip away from English — prevents false positives
 * on pages that merely quote a few CJK phrases.
 */
export function detectLanguage(text: string): Language {
  if (!text || text.length < 60) return "en";

  const hiragana = countInRange(text, 0x3040, 0x309f);
  const katakana = countInRange(text, 0x30a0, 0x30ff);
  const kana = hiragana + katakana;

  const hangul = countInRange(text, 0xac00, 0xd7af);

  const cjk = countInRange(text, 0x4e00, 0x9fff);

  const threshold = Math.max(15, text.length * 0.05);

  if (kana >= threshold) return "ja";
  if (hangul >= threshold) return "ko";
  if (cjk >= threshold) return "zh";
  return "en";
}

function countInRange(text: string, lo: number, hi: number): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i)!;
    if (cp >= lo && cp <= hi) count++;
    if (cp > 0xffff) i++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Pattern dictionaries
// ---------------------------------------------------------------------------

const EN_PATTERNS: LanguagePatterns = {
  blufVerbs:
    /\b(is|are|helps|provides|offers|refers to|means|enables|builds|delivers|supports|allows)\b/i,
  questionMark: /\?/,
  faqKeywords: /\b(faq|frequently asked questions|questions and answers|q&a)\b/i,
  sourceAttribution: /\baccording to\b/i,
  definitional:
    /\b(is defined as|are defined as|refers to|means|is a|is an)\b/i,
  researchLanguage:
    /\b(original research|study|survey|benchmark|dataset|methodology|proprietary data|we analyzed|we measured|we surveyed|we found)\b/i,
  bylinePattern:
    /\b(by|written by|reviewed by|edited by|author:?|contributor:?)\s+[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,3}\b/,
  commercialKeywords:
    /\b(pricing|free trial|start free|sign up|signup|sign-up|get started|request a demo|schedule a demo|book a demo|buy now|add to cart|subscribe|per (?:month|user|seat)|saas|platform|software)\b/i,
  technicalKeywords:
    /\b(api|sdk|cli|library|framework|open[- ]source|developer (?:portal|docs|guide)|npm install|pip install|brew install|github\.com\/[^\s]+)\b/i,
  visibleModifiedPattern:
    /\b(updated|last updated|modified|last modified|revised)\b/i,
  datePattern:
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+(?:19|20)\d{2}\b/i,
};

const ZH_PATTERNS: LanguagePatterns = {
  blufVerbs: /是|提供|帮助|指|意味着|能够|可以|使|建立|带来|支持|允许|让|用于/,
  questionMark: /？/,
  faqKeywords: /常见问题|常见问答|问答|问题解答|常见疑问|FAQ/,
  sourceAttribution: /根据|据报道|据悉|指出|表示|报道|透露|显示|数据显示|据.*?称/,
  definitional: /是指|定义为|指的是|也就是|即|意味着|所谓|简单来说/,
  researchLanguage:
    /研究|调查|基准测试|数据集|方法论|专有数据|分析[了过]|测量[了过]|调查[了过]|实验|数据表明|数据显示|统计/,
  bylinePattern:
    /(?:作者|撰写|审阅|编辑|责编|译者|来源|出处)[：:\s]|文[／/]|记者[：:\s]|撰稿[：:\s]/,
  commercialKeywords:
    /定价|免费试用|免费注册|开始使用|立即注册|申请演示|预约演示|立即购买|加入购物车|订阅|每[月年]|每位用户|每用户|SaaS|平台|软件|解决方案/,
  technicalKeywords:
    /API|SDK|CLI|开源|开发者|开发文档|文档|代码库|框架|npm install|pip install|GitHub/,
  visibleModifiedPattern:
    /最后更新|更新于|最近更新|更新时间|最后修改|修订日期|更新日期/,
  datePattern: /\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日/,
};

const JA_PATTERNS: LanguagePatterns = {
  blufVerbs:
    /です|ます|である|提供|支援|参考|意味|可能にする|できる|行う|用いる|使う|実現/,
  questionMark: /？/,
  faqKeywords: /よくある質問|よくあるご質問|質問と回答|Q&A|FAQ/,
  sourceAttribution: /によると|によれば|述べている|報じた|伝えた|示した|発表した|明らかにした/,
  definitional: /とは|と定義|を指す|というのは|である|すなわち|意味する|と呼ばれる/,
  researchLanguage:
    /研究|調査|ベンチマーク|データセット|方法論|独自データ|分析した|測定した|実験|統計/,
  bylinePattern:
    /(?:著者|執筆|監修|編集|投稿者|寄稿者|翻訳|文責)[：:\s]|による|文[／/]/,
  commercialKeywords:
    /価格|無料トライアル|無料登録|今すぐ|登録|デモ[を依]|今すぐ購入|購読|月額|ユーザーあたり|SaaS|プラットフォーム|ソフトウェア|ソリューション/,
  technicalKeywords:
    /API|SDK|CLI|オープンソース|開発者|ドキュメント|ライブラリ|フレームワーク|npm install|pip install|GitHub/,
  visibleModifiedPattern: /更新日|最終更新|更新日時|改定日|改訂日|最終更新日/,
  datePattern: /\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日/,
};

const KO_PATTERNS: LanguagePatterns = {
  blufVerbs: /입니다|합니다|제공|도움|의미|가능|지원|할 수|통해|사용|구현/,
  questionMark: /？/,
  faqKeywords: /자주 묻는 질문|질문과 답변|Q&A|FAQ/,
  sourceAttribution: /에 따르면|에 의하면|라고 밝혔다|전했다|나타났다|보도했다|발표했다|밝혀졌다/,
  definitional: /란|이란|정의|의미한다|뜻한다|가리킨다|지칭한다|말한다/,
  researchLanguage:
    /연구|조사|벤치마크|데이터셋|방법론|독점 데이터|분석|측정|실험|통계/,
  bylinePattern:
    /(?:작성자|글쓴이|검토|편집|기자|출처|번역)[：:\s]|글[／/]/,
  commercialKeywords:
    /가격|무료 체험|무료 가입|시작하기|가입하기|데모|구독|월간|사용자당|SaaS|플랫폼|소프트웨어|솔루션/,
  technicalKeywords:
    /API|SDK|CLI|오픈소스|개발자|문서|라이브러리|프레임워크|npm install|pip install|GitHub/,
  visibleModifiedPattern: /최종 업데이트|마지막 업데이트|업데이트 날짜|수정일|갱신일|업데이트됨/,
  datePattern: /\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일/,
};

const PATTERNS: Record<Language, LanguagePatterns> = {
  en: EN_PATTERNS,
  zh: ZH_PATTERNS,
  ja: JA_PATTERNS,
  ko: KO_PATTERNS,
  unknown: EN_PATTERNS,
};

/** Retrieve the pattern set for a given language. Unknown falls back to English. */
export function getPatterns(language: Language): LanguagePatterns {
  return PATTERNS[language] ?? PATTERNS.en;
}

// ---------------------------------------------------------------------------
// CJK helpers
// ---------------------------------------------------------------------------

/** Count CJK Unified Ideographs, kana, and Hangul characters in text. */
export function countCJKChars(text: string): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i)!;
    if (
      (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified Ideographs
      (cp >= 0x3400 && cp <= 0x4dbf) || // CJK Extension A
      (cp >= 0x3040 && cp <= 0x309f) || // Hiragana
      (cp >= 0x30a0 && cp <= 0x30ff) || // Katakana
      (cp >= 0xac00 && cp <= 0xd7af)    // Hangul Syllables
    ) {
      count++;
    }
    if (cp > 0xffff) i++;
  }
  return count;
}
