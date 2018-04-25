 /* jshint node: true */
'use strict';

// tests for the Edge SDP parser. Tests plain JS so can be run in node.
const SDPUtils = require('../sdp.js');

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const videoSDP =
  'v=0\r\no=- 1376706046264470145 3 IN IP4 127.0.0.1\r\ns=-\r\n' +
  't=0 0\r\na=group:BUNDLE video\r\n' +
  'a=msid-semantic: WMS EZVtYL50wdbfttMdmVFITVoKc4XgA0KBZXzd\r\n' +
  'm=video 9 UDP/TLS/RTP/SAVPF 100 101 107 116 117 96 97 99 98\r\n' +
  'c=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\n' +
  'a=ice-ufrag:npaLWmWDg3Yp6vJt\r\na=ice-pwd:pdfQZAiFbcsFmUKWw55g4TD5\r\n' +
  'a=fingerprint:sha-256 3D:05:43:01:66:AC:57:DC:17:55:08:5C:D4:25:D7:CA:FD' +
  ':E1:0E:C1:F4:F8:43:3E:10:CE:3E:E7:6E:20:B9:90\r\n' +
  'a=setup:actpass\r\na=mid:video\r\n' +
  'a=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\n' +
  'a=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\n' +
  'a=extmap:4 urn:3gpp:video-orientation\r\na=sendrecv\r\na=rtcp-mux\r\n' +
  'a=rtcp-rsize\r\na=rtpmap:100 VP8/90000\r\n' +
  'a=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\n' +
  'a=rtcp-fb:100 goog-remb\r\na=rtcp-fb:100 transport-cc\r\n' +
  'a=rtpmap:101 VP9/90000\r\na=rtcp-fb:101 ccm fir\r\na=rtcp-fb:101 nack\r\n' +
  'a=rtcp-fb:101 nack pli\r\na=rtcp-fb:101 goog-remb\r\n' +
  'a=rtcp-fb:101 transport-cc\r\na=rtpmap:107 H264/90000\r\n' +
  'a=rtcp-fb:107 ccm fir\r\na=rtcp-fb:107 nack\r\na=rtcp-fb:107 nack pli\r\n' +
  'a=rtcp-fb:107 goog-remb\r\na=rtcp-fb:107 transport-cc\r\n' +
  'a=rtpmap:116 red/90000\r\na=rtpmap:117 ulpfec/90000\r\n' +
  'a=rtpmap:96 rtx/90000\r\na=fmtp:96 apt=100\r\na=rtpmap:97 rtx/90000\r\n' +
  'a=fmtp:97 apt=101\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=107\r\n' +
  'a=rtpmap:98 rtx/90000\r\na=fmtp:98 apt=116\r\n' +
  'a=ssrc-group:FID 1734522595 2715962409\r\n' +
  'a=ssrc:1734522595 cname:VrveQctHgkwqDKj6\r\n' +
  'a=ssrc:1734522595 msid:EZVtYL50wdbfttMdmVFITVoKc4XgA0KBZXzd ' +
  '63238d63-9a20-4afc-832c-48678926afce\r\na=ssrc:1734522595 ' +
  'mslabel:EZVtYL50wdbfttMdmVFITVoKc4XgA0KBZXzd\r\n' +
  'a=ssrc:1734522595 label:63238d63-9a20-4afc-832c-48678926afce\r\n' +
  'a=ssrc:2715962409 cname:VrveQctHgkwqDKj6\r\n' +
  'a=ssrc:2715962409 msid:EZVtYL50wdbfttMdmVFITVoKc4XgA0KBZXzd ' +
  '63238d63-9a20-4afc-832c-48678926afce\r\n' +
  'a=ssrc:2715962409 mslabel:EZVtYL50wdbfttMdmVFITVoKc4XgA0KBZXzd\r\n' +
  'a=ssrc:2715962409 label:63238d63-9a20-4afc-832c-48678926afce\r\n';

// Firefox offer
const videoSDP2 =
  'v=0\r\n' +
  'o=mozilla...THIS_IS_SDPARTA-45.0 5508396880163053452 0 IN IP4 0.0.0.0\r\n' +
  's=-\r\nt=0 0\r\n' +
  'a=fingerprint:sha-256 CC:0D:FB:A8:9F:59:36:57:69:F6:2C:0E:A3:EA:19:5A:E0' +
  ':D4:37:82:D4:7B:FB:94:3D:F6:0E:F8:29:A7:9E:9C\r\n' +
  'a=ice-options:trickle\r\na=msid-semantic:WMS *\r\n' +
  'm=video 9 UDP/TLS/RTP/SAVPF 120 126 97\r\n' +
  'c=IN IP4 0.0.0.0\r\na=sendrecv\r\n' +
  'a=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;' +
  'packetization-mode=1\r\n' +
  'a=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1\r\n' +
  'a=fmtp:120 max-fs=12288;max-fr=60\r\n' +
  'a=ice-pwd:e81aeca45422c37aeb669274d8959200\r\n' +
  'a=ice-ufrag:30607a5c\r\na=mid:sdparta_0\r\n' +
  'a=msid:{782ddf65-d10e-4dad-80b9-27e9f3928d82} ' +
  '{37802bbd-01e2-481e-a2e8-acb5423b7a55}\r\n' +
  'a=rtcp-fb:120 nack\r\na=rtcp-fb:120 nack pli\r\na=rtcp-fb:120 ccm fir\r\n' +
  'a=rtcp-fb:126 nack\r\na=rtcp-fb:126 nack pli\r\na=rtcp-fb:126 ccm fir\r\n' +
  'a=rtcp-fb:97 nack\r\na=rtcp-fb:97 nack pli\r\na=rtcp-fb:97 ccm fir\r\n' +
  'a=rtcp-mux\r\na=rtpmap:120 VP8/90000\r\na=rtpmap:126 H264/90000\r\n' +
  'a=rtpmap:97 H264/90000\r\na=setup:actpass\r\n' +
  'a=ssrc:98927270 cname:{0817e909-53be-4a3f-ac45-b5a0e5edc3a7}\r\n';

describe('splitSections', () => {
  let parsed;
  it('returns an array', () => {
    parsed = SDPUtils.splitSections(videoSDP);
    expect(parsed).to.be.an('Array');
  });

  it('splits video-only SDP with only LF into two sections', () => {
    parsed = SDPUtils.splitSections(videoSDP.replace(/\r\n/g, '\n'));
    expect(parsed.length).to.equal(2);
  });

  it('splits video-only SDP into two sections', () => {
    parsed = SDPUtils.splitSections(videoSDP);
    expect(parsed.length).to.equal(2);
  });
  
  it('every section ends with CRLF', () => {
    expect(parsed.every(function(section) {
      return section.substr(-2) === '\r\n';
    })).to.equal(true);
  });

  it('joining sections without separator recreates SDP', () => {
    expect(parsed.join('')).to.equal(videoSDP);
  });
});

describe('getDescription', () => {
  let parsed;
  it('returns a string with the session description part', () => {
    parsed = SDPUtils.getDescription(videoSDP);
    expect(parsed).to.be.an('String');
  });

  it('ends with a CRLF', () => {
    parsed = SDPUtils.getDescription(videoSDP);
    expect(parsed.substr(-2)).to.equal('\r\n');
  });
});

describe('getMediaSections', () => {
  let parsed;
  it('returns an array', () => {
    parsed = SDPUtils.getMediaSections(videoSDP);
    expect(parsed).to.be.an('Array');
  });

  it('splits video-only SDP into one section', () => {
    parsed = SDPUtils.getMediaSections(videoSDP);
    expect(parsed.length).to.equal(1);
  });
});

describe('parseRtpParameters with the video sdp example', () => {
  const sections = SDPUtils.splitSections(videoSDP);
  const parsed = SDPUtils.parseRtpParameters(sections[1]);

  it('parses 9 codecs', () => {
    expect(parsed.codecs.length).to.equal(9);
  });

  describe('fecMechanisms', () => {
    it('parses 2 fecMechanisms', () => {
      expect(parsed.fecMechanisms.length).to.equal(2);
    });

    it('parses RED as FEC mechanism', () => {
      expect(parsed.fecMechanisms).to.contain('RED');
    });

    it('parses ULPFEC as FEC mechanism', () => {
      expect(parsed.fecMechanisms).to.contain('ULPFEC');
    });
  });

  it('parses 3 headerExtensions', () => {
    expect(parsed.headerExtensions.length).to.equal(3);
  });
});

describe('fmtp', () => {
  const line = 'a=fmtp:111 minptime=10; useinbandfec=1';
  const parsed = SDPUtils.parseFmtp(line);

  describe('parsing', () => {
    it('parses 2 parameters', () => {
      expect(Object.keys(parsed).length).to.equal(2);
    });

    it('parses minptime', () => {
      expect(parsed.minptime).to.equal('10');
    });

    it('parses useinbandfec', () => {
      expect(parsed.useinbandfec).to.equal('1');
    });
  });

  describe('serialization', () => {
    it('uses preferredPayloadType', () => {
      let out = SDPUtils.writeFmtp({
        preferredPayloadType: 111,
        parameters: {minptime: '10'}
      }).trim();
      expect(out).to.equal('a=fmtp:111 minptime=10');
    });

    it('returns an empty string if there are no parameters', () => {
      let out = SDPUtils.writeFmtp({
        preferredPayloadType: 111,
        parameters: {}
      }).trim();
      expect(out).to.equal('');
    });

    // TODO: is this safe or can the order change?
    // serialization strings the extra whitespace after ';'
    it('does not add extra spaces between parameters', () => {
      let out = SDPUtils.writeFmtp({
        payloadType: 111,
        parameters: parsed
      }).trim();
      expect(out).to.equal(line.replace('; ', ';'));
    });

    it('serializes non-key-value telephone-event', () => {
      const out = SDPUtils.writeFmtp({ payloadType: 100, parameters: {'0-15': undefined }});
      expect(out).to.equal('a=fmtp:100 0-15\r\n');
    });
  });
});

describe('rtpmap', () => {
  const line = 'a=rtpmap:111 opus/48000/2';
  const parsed = SDPUtils.parseRtpMap(line);
  describe('parsing', () => {
    it('parses codec name', () => {
      expect(parsed.name).to.equal('opus');
    });

    it('parses payloadType as integer', () => {
      expect(parsed.payloadType).to.equal(111);
    });

    it('parses clockRate as an integer', () => {
      expect(parsed.clockRate).to.equal(48000);
    });

    it('parses numChannels as an integer', () => {
      expect(parsed.numChannels).to.equal(2);
    });

    it('parses numChannels and defaults to 1 if not present', () => {
      expect(SDPUtils.parseRtpMap('a=rtpmap:0 PCMU/8000').numChannels)
          .to.equal(1);
    });
  });

  describe('serialization', () => {
    it('generates the expected output', () => {
      let out = SDPUtils.writeRtpMap({
        payloadType: 111,
        name: 'opus',
        clockRate: 48000,
        numChannels: 2
      }).trim();
      expect(out).to.equal(line);
    });

    it('uses preferredPayloadType', () => {
      let out = SDPUtils.writeRtpMap({
        preferredPayloadType: 111,
        name: 'opus',
        clockRate: 48000,
        numChannels: 2
      }).trim();
      expect(out).to.equal(line);
    });

    it('does not append numChannels when there is only one channel', () => {
      let out = SDPUtils.writeRtpMap({
        payloadType: 0,
        name: 'pcmu',
        clockRate: 8000,
        numChannels: 1
      }).trim();
      expect(out).to.equal('a=rtpmap:0 pcmu/8000');
    });
  });
});

describe('parseRtpEncodingParameters', () => {
  let sections = SDPUtils.splitSections(videoSDP);
  let data = SDPUtils.parseRtpEncodingParameters(sections[1]);
  it('parses 8 encoding parameters for four codecs with fec', () => {
    expect(data.length).to.equal(8);
  });

  it('parses primary ssrc', () => {
    expect(data[0].ssrc).to.equal(1734522595);
  });

  it('parses RTX encoding and ssrc', () => {
    expect(data[0].rtx);
    expect(data[0].rtx.ssrc).to.equal(2715962409);
  });

  it('parses ssrc from cname as a fallback', () => {
    sections = SDPUtils.splitSections(videoSDP2);
    data = SDPUtils.parseRtpEncodingParameters(sections[1]);

    expect(data.length).to.equal(1);
    expect(data[0].ssrc).to.equal(98927270);
  });

  describe('bandwidth modifier', () => {
    it('of type AS is parsed', () => {
      sections = SDPUtils.splitSections(
          videoSDP.replace('c=IN IP4 0.0.0.0\r\n',
                           'c=IN IP4 0.0.0.0\r\nb=AS:512\r\n')
      );
      data = SDPUtils.parseRtpEncodingParameters(sections[1]);

      // conversion formula from jsep.
      expect(data[0].maxBitrate).to.equal(512 * 1000 * 0.95 - (50 * 40 * 8))
    });

    it('of type TIAS is parsed', () => {
      sections = SDPUtils.splitSections(
          videoSDP.replace('c=IN IP4 0.0.0.0\r\n',
                           'c=IN IP4 0.0.0.0\r\nb=TIAS:512000\r\n')
      );
      data = SDPUtils.parseRtpEncodingParameters(sections[1]);
      expect(data[0].maxBitrate).to.equal(512000);
    });

    it('of unknown type is ignored', () => {
      sections = SDPUtils.splitSections(
          videoSDP.replace('c=IN IP4 0.0.0.0\r\n',
                           'c=IN IP4 0.0.0.0\r\nb=something:1\r\n')
      );
      data = SDPUtils.parseRtpEncodingParameters(sections[1]);
      expect(data[0].maxBitrate).to.equal(undefined);
    });
  });
});

describe('rtcp feedback', () => {
  describe('serialization', () => {
    it('serializes', () => {
      const codec = { payloadType: 100,
        rtcpFeedback: [
          { type: 'nack', parameter: 'pli' },
          { type: 'nack' }
        ]
      };
      const expected = 'a=rtcp-fb:100 nack pli\r\n' +
        'a=rtcp-fb:100 nack\r\n';
      expect(SDPUtils.writeRtcpFb(codec)).to.equal(expected);
    });

    it('serialized preferredPayloadType', () => {
      const codec = { preferredPayloadType: 100,
        rtcpFeedback: [
          { type: 'nack' }
        ]
      };
      const expected = 'a=rtcp-fb:100 nack\r\n';
      expect(SDPUtils.writeRtcpFb(codec)).to.equal(expected);
    });
    
    it('does nothing if there is no rtcp feedback', () => {
      const codec = { payloadType: 100,
        rtcpFeedback: []
      };
      expect(SDPUtils.writeRtcpFb(codec)).to.equal('');
    });
  })
});

it('getKind', () => {
  const mediaSection = 'm=video 9 UDP/TLS/RTP/SAVPF 120 126 97\r\n' +
      'c=IN IP4 0.0.0.0\r\na=sendrecv\r\n';
  expect(SDPUtils.getKind(mediaSection)).to.equal('video');
});

describe('getDirection', () => {
  const mediaSection = 'm=video 9 UDP/TLS/RTP/SAVPF 120 126 97\r\n' +
      'c=IN IP4 0.0.0.0\r\na=sendonly\r\n';
  describe('parses the direction from the mediaSection', () => {
    ['sendrecv', 'sendonly', 'recvonly', 'inactive'].forEach((direction) => {
      expect(SDPUtils.getDirection(mediaSection.replace('sendonly', direction))).to.equal(direction);
    });
  });

  it('falls back to sendrecv', () => {
    expect(SDPUtils.getDirection('')).to.equal('sendrecv');
  });

  it('falls back to getting the direction from the session part', () => {
    expect(SDPUtils.getDirection('', 'a=sendonly')).to.equal('sendonly');
  });
});

describe('isRejected', () => {
  it('returns true if the m-lines port is 0', () => {
    const rej = 'm=video 0 UDP/TLS/RTP/SAVPF 120 126 97\r\n';
    expect(SDPUtils.isRejected(rej)).to.equal(true);
  });

  it('returns false for a non-zero port', () => {
    const ok = 'm=video 9 UDP/TLS/RTP/SAVPF 120 126 97\r\n';
    expect(SDPUtils.isRejected(ok)).to.equal(false);
  });
});

describe('parseMsid', () => {
  const spec = 'a=msid:stream track\r\n';
  const planB = 'a=ssrc:1 msid:stream track\r\n';

  const parsed = SDPUtils.parseMsid(spec);

  it('returns undefined if no msid is found', () => {
    expect(SDPUtils.parseMsid('')).to.equal(undefined);
  });

  it('returns an object if a msid is found', () => {
    expect(parsed).to.be.an('Object');
  });

  it('parses the stream id', () => {
    expect(parsed.stream).to.equal('stream');
  });

  it('parses the track id', () => {
    expect(parsed.track).to.equal('track');
  });

  it('parses legacy plan B stuff', () => {
    let legacy = SDPUtils.parseMsid(planB);
    expect(legacy).to.be.an('Object');
    expect(legacy.stream).to.equal('stream');
    expect(legacy.track).to.equal('track');
  });
});

describe('parseRtcpParameters', () => {
  const rtcp = SDPUtils.parseRtcpParameters(videoSDP);

  it('parses cname', () => {
    expect(rtcp.cname).to.equal('VrveQctHgkwqDKj6');
  });

  it('parses ssrc', () => {
    expect(rtcp.ssrc).to.equal(1734522595);
  });

  it('parses reduced size', () => {
    expect(rtcp.reducedSize).to.equal(true);
  });

  it('parses compoind', () => {
    expect(rtcp.compound).to.equal(false);
  });

  it('parses mux', () => {
    expect(rtcp.mux).to.equal(true);
  });
});

describe('parseFingerprint', () => {
  const res = SDPUtils.parseFingerprint('a=fingerprint:ALG fp');
  it('parses and lowercaseѕ the algorithm', () => {
    expect(res.algorithm).to.equal('alg');
  });
  it('parses the fingerprint value', () => {
    expect(res.value).to.equal('fp');
  });
});

describe('getDtlsParameters', () => {
  const fp = 'a=fingerprint:sha-256 so:me:th:in:g1\r\n' +
      'a=fingerprint:SHA-1 somethingelse';
  const dtlsParameters = SDPUtils.getDtlsParameters(fp, '');

  it('sets the role to auto', () => {
    expect(dtlsParameters.role).to.equal('auto');
  })

  it('parses two fingerprints', () => {
    expect(dtlsParameters.fingerprints.length).to.equal(2);
  });

  it('extracts the algorithm', () => {
    expect(dtlsParameters.fingerprints[0].algorithm).to.equal('sha-256');
    expect(dtlsParameters.fingerprints[1].algorithm).to.equal('sha-1');
  });

  it('extracts the fingerprints', () => {
    expect(dtlsParameters.fingerprints[0].value).to.equal('so:me:th:in:g1');
    expect(dtlsParameters.fingerprints[1].value).to.equal('somethingelse');
  });
});

describe('writeDtlsParameters', () => {
  const type = 'actpass';
  const parameters = {fingerprints: [
     {algorithm: 'sha-256', value: 'so:me:th:in:g1'},
     {algorithm: 'SHA-1', value: 'somethingelse'}
  ]};

  const serialized = SDPUtils.writeDtlsParameters(parameters, type);
  it('serializes the fingerprints', () => {
     expect(serialized).to.contain('a=fingerprint:sha-256 so:me:th:in:g1');
     expect(serialized).to.contain('a=fingerprint:SHA-1 somethingelse');
  });
  it('serializes the type', () => {
    expect(serialized).to.contain('a=setup:' + type);
  });
});

describe('getIceParameters', () => {
  const sections = SDPUtils.splitSections(videoSDP);
  const ice = SDPUtils.getIceParameters(sections[1], sections[0]);
  it('returns an object', () => {
    expect(ice).to.be.an('Object');
  });

  it('parses the ufrag', () => {
    expect(ice.usernameFragment).to.equal('npaLWmWDg3Yp6vJt');
  });
  it('parses the password', () => {
    expect(ice.password).to.equal('pdfQZAiFbcsFmUKWw55g4TD5');
  });
});

describe('writeIceParameters', () => {
  const serialized= SDPUtils.writeIceParameters({
      usernameFragment: 'foo',
      password: 'bar'
  });

  it('serializes the usernameFragment', () => {
     expect(serialized).to.contain('a=ice-ufrag:foo');
  });

  it('serializes the password', () => {
     expect(serialized).to.contain('a=ice-pwd:bar');
  });
});

describe('getMid', () => {
  const mediaSection = 'm=video 9 UDP/TLS/RTP/SAVPF 120 126 97\r\n' +
      'c=IN IP4 0.0.0.0\r\na=sendrecv\r\n';
  it('returns undefined if no mid attribute is found', () => {
    expect(SDPUtils.getMid(mediaSection)).to.equal(undefined);
  });
  
  it('returns the mid attribute', () => {
   expect(SDPUtils.getMid(mediaSection + 'a=mid:foo\r\n')).to.equal('foo');
  });
});

describe('parseIceOptions', () => {
  const result = SDPUtils.parseIceOptions('a=ice-options:trickle something');
  it('returns an array of options', () => {
    expect(result).to.be.an('Array');
    expect(result.length).to.equal(2);

    expect(result[0]).to.equal('trickle');
    expect(result[1]).to.equal('something');
  });
});

describe('extmap', () => {
  describe('parseExtmap', () => {
    let res = SDPUtils.parseExtmap('a=extmap:2 uri');

    it('parses the extmap id', () => {
      expect(res.id).to.equal(2);
    });

    it('parses the extmap uri', () => {
      expect(res.uri).to.equal('uri');
    });

    it('parses the direction defaulting to sendrecv', () => {
      expect(res.direction).to.equal('sendrecv');
    });

    it('parses id and direction when direction is present', () => {
      res = SDPUtils.parseExtmap('a=extmap:2/sendonly uri');
      expect(res.id === 2, 'parses extmap id when direction is present');
      expect(res.direction === 'sendonly', 'parses extmap direction');
    });
  });

  describe('writeExtmap', () => {
    it('writes extmap without direction', () => {
      expect(SDPUtils.writeExtmap({id: 1, uri: 'uri'}))
          .to.equal('a=extmap:1 uri\r\n');
    });

    it('writes extmap without direction when direction is sendrecv (default)', () => {
      expect(SDPUtils.writeExtmap({id: 1, uri: 'uri', direction: 'sendrecv'}))
          .to.equal('a=extmap:1 uri\r\n');
    });

    it('writes extmap with direction when direction is not sendrecv', () => {
      expect(SDPUtils.writeExtmap({id: 1, uri: 'uri', direction: 'sendonly'}))
          .to.equal('a=extmap:1/sendonly uri\r\n');
    });

    it('writes extmap with preferredId when id is not present', () => {
      expect(SDPUtils.writeExtmap({preferredId: 1, uri: 'uri'}))
          .to.equal('a=extmap:1 uri\r\n');
    });
  });
});

describe('ice candidate', () => {
  describe('parsing', () => {
    const candidateString = 'candidate:702786350 2 udp 41819902 8.8.8.8 60769 ' +
        'typ relay raddr 8.8.8.8 rport 1234 ' +
        'tcptype active ' +
        'ufrag abc ' +
        'generation 0';
    const candidate = SDPUtils.parseCandidate(candidateString);

    it('parses foundation', () => {
      expect(candidate.foundation).to.equal('702786350');
    });
    it('parses component', () => {
      expect(candidate.component).to.equal(2);
    });
    it('parses priority', () => {
      expect(candidate.priority).to.equal(41819902, 'parses priority');
    });

    it('parses ip', () => {
      expect(candidate.ip).to.equal('8.8.8.8');
    });

    it('parses protocol', () => {
      expect(candidate.protocol).to.equal('udp');
    });

    it('parses port', () => {
      expect(candidate.port).to.equal(60769);
    });

    it('parses type', () => {
      expect(candidate.type).to.equal('relay');
    });

    it('parses tcpType', () => {
      expect(candidate.tcpType).to.equal('active');
    });

    it('parses relatedAddress', () => {
      expect(candidate.relatedAddress).to.equal('8.8.8.8');
    });

    it('parses relatedPort', () => {
      expect(candidate.relatedPort).to.equal(1234);
    });

    it('parses ufrag', () => {
      expect(candidate.ufrag).to.equal('abc');
    });

    it('parses ufrag as usernameFragment', () => {
      expect(candidate.usernameFragment).to.equal('abc');
    });

    it('parses an unknown key-value element like generation', () => {
      expect(candidate.generation).to.equal('0');
    });

    it('parses the candidate with the legacy a= prefix', () => {
      expect(SDPUtils.parseCandidate('a=' + candidateString).foundation)
          .to.equal('702786350');
    });
  });

  describe('serialization', () => {
    let serialized;
    let candidate;
    beforeEach(() => {
      candidate = {
        foundation: '702786350',
        component: 2,
        protocol: 'udp',
        priority: 4189902,
        ip: '8.8.8.8',
        port: 60769,
        type: 'host',
      };
    });

    it('serializes a candidate with everything', () => {
      candidate.protocol = 'tcp';
      candidate.tcpType = 'active';
      candidate.type = 'relay';
      candidate.relatedAddress = '8.8.8.8';
      candidate.relatedPort = 1234;

      serialized = SDPUtils.writeCandidate(candidate).trim();
      expect(serialized).to.equal('candidate:702786350 2 TCP 4189902 8.8.8.8 ' +
          '60769 typ relay raddr 8.8.8.8 rport 1234 tcptype active');
    });

    it('adds ufrag if present', () => {
      candidate.ufrag = 'abc';
      serialized = SDPUtils.writeCandidate(candidate).trim();
      expect(serialized).to.equal('candidate:702786350 2 UDP 4189902 8.8.8.8 ' +
          '60769 typ host ufrag abc');
    });

    it('adds ufrag if usernameFragment is present', () => {
      candidate.usernameFragment = 'abc';
      serialized = SDPUtils.writeCandidate(candidate).trim();
      expect(serialized).to.equal('candidate:702786350 2 UDP 4189902 8.8.8.8 ' +
          '60769 typ host ufrag abc');
    });

    it('does not add relatedAddress and relatedPort for host candidates', () => {
      candidate.relatedAddress = '8.8.8.8';
      candidate.relatedPort = 1234;

      serialized = SDPUtils.writeCandidate(candidate).trim();
      expect(serialized).to.equal('candidate:702786350 2 UDP 4189902 8.8.8.8 ' +
          '60769 typ host');
    });

    it('ignores tcpType for udp candidates', () => {
      candidate.tcpType = 'active';
      serialized = SDPUtils.writeCandidate(candidate).trim();
      expect(serialized).to.equal('candidate:702786350 2 UDP 4189902 8.8.8.8 ' +
          '60769 typ host');
    });
  });
});

describe('writeRtpDescription', () => {
  const kind = 'audio';
  let parameters;
  beforeEach(() => {
    parameters = {
      codecs: [{
        payloadType: 111,
        name: 'opus',
        clockRate: 48000,
        numChannels: 2,
        parameters: {
          minptime: '10'
        }
      }],
      headerExtensions: [{
        id: 2,
        uri: 'urn:ietf:params:rtp-hdrext:toffset'
      }],
    };
  });

  it('generates a rejected m-line if the codecs are empty', () => {
    parameters.codecs = [];
    const serialized = SDPUtils.writeRtpDescription(kind, parameters);
    expect(serialized).to.contain('m=' + kind + ' 0 ');
  });

  it('generates rtpmap lines', () => {
    const serialized = SDPUtils.writeRtpDescription(kind, parameters);
    expect(serialized).to.contain('a=rtpmap:111');
  });

  it('generates rtpmap lines using preferredPayloadType', () => {
    delete parameters.codecs[0].payloadType;
    parameters.codecs[0].preferredPayloadType = 111;
    const serialized = SDPUtils.writeRtpDescription(kind, parameters);
    expect(serialized).to.contain('a=rtpmap:111');
  });


  it('generates fmtp lines for codecs with parameters', () => {
    const serialized = SDPUtils.writeRtpDescription(kind, parameters);
    expect(serialized).to.contain('a=fmtp:');
  });

  it('does not generate fmtp lines for codecs with no parameters', () => {
    delete parameters.codecs[0].parameters;
    const serialized = SDPUtils.writeRtpDescription(kind, parameters);
    expect(serialized).not.to.contain('a=fmtp:');
  });

  it('generates rtcp-fb lines for codecs with rtcp-feedback', () => {
    parameters.codecs[0].rtcpFeedback = [{type: 'nack'}];
    const serialized = SDPUtils.writeRtpDescription(kind, parameters);
    expect(serialized).to.contain('a=rtcp-fb:');
  });

  it('does not generate rtcp-fb lines for codecs with no feedback', () => {
    const serialized = SDPUtils.writeRtpDescription(kind, parameters);
    expect(serialized).not.to.contain('a=rtcp-fb:');
  });
 
  it('generates extmap lines for headerExtensions', () => {
    const serialized = SDPUtils.writeRtpDescription(kind, parameters);
    expect(serialized).to.contain('a=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\n');
  });

  it('does not generate extmap lines if there are no headerExtensions', () => {
    parameters.headerExtensions = [];
    const serialized = SDPUtils.writeRtpDescription(kind, parameters);
    expect(serialized).not.to.contain('a=extmap:');
  });
});

describe('writeBoilerPlate', () => {
  let sdp;
  beforeEach(() => {
    sdp = SDPUtils.writeSessionBoilerplate();
  });
  
  it('returns a string', () => {
    expect(sdp).to.be.a('String');
  });

  it('generates unique id', () => {
    expect(sdp).to.not.equal(SDPUtils.writeSessionBoilerplate());
  });

  it('uses passed in session id', () => {
    let sessionId = 'uniqueTestSessionId1';
    let sdpWithSession = SDPUtils.writeSessionBoilerplate(sessionId);
    expect(sdpWithSession).to.include(' ' + sessionId + ' ');
  });

  it('defaults to version 2', () => {
    let ver = 4404;
    let id = 123;
    let sdpWithSessionVersion = SDPUtils.writeSessionBoilerplate(id, ver);
    expect(sdpWithSessionVersion).to.include(id + ' ' + ver + ' ');
  });

  it('uses passed session version', () => {
    let ver = 4404;
    let sdpWithSessionVersion = SDPUtils.writeSessionBoilerplate(undefined, ver);
    expect(sdpWithSessionVersion).to.include(' ' + ver + ' ');
  });
});

describe('parseMLine', () => {
  const result = SDPUtils.parseMLine('m=video 9 UDP/TLS/RTP/SAVPF 100 101 107 116 117 96 97 99 98');
  it('parses the kind', () => {
    expect(result.kind).to.equal('video');
  });

  it('parses the port as an integer', () => {
    expect(result.port).to.equal(9);
  });
  
  it('parses the protocol', () => {
    expect(result.protocol).to.equal('UDP/TLS/RTP/SAVPF');
  });

  it('parses the format list', () => {
    expect(result.fmt).to.equal('100 101 107 116 117 96 97 99 98');
  });
});

describe('parseOLine', () => {
  const result = SDPUtils.parseOLine('o=username someid 15 IN IP4 0.0.0.0');
  it('parses the username', () =>
    expect(result.username).to.equal('username'));
  it('parse the session id', () =>
    expect(result.sessionId).to.equal('someid'));
  it('parses the session version', () =>
    expect(result.sessionVersion).to.equal(15));
  it('parses the netType', () => 
    expect(result.netType).to.equal('IN'));
  it('parses the addressType', () =>
    expect(result.addressType).to.equal('IP4'));
  it('parses the address', () =>
    expect(result.address).to.equal('0.0.0.0'));
});
