import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { AuthenticatedRequest } from './auth';
import { SelectionService } from './selection.service';
const id=(v:string)=>{const n=Number(v);if(!Number.isInteger(n)||n<1)throw new BadRequestException('Identificador inválido');return n;};
@Controller('api/selection')
export class SelectionController {
  constructor(private readonly service:SelectionService) {}
  @Get('applications/:id') detail(@Req() r:AuthenticatedRequest,@Param('id') application:string){return this.service.detail(r.user,id(application));}
  @Get('talent-pool') talentPool(@Req() r:AuthenticatedRequest){return this.service.talentPool(r.user);}
  @Get('my-interviews') myInterviews(@Req() r:AuthenticatedRequest){return this.service.myInterviews(r.user);}
  @Post('applications/:id/communications') communicate(@Req() r:AuthenticatedRequest,@Param('id') application:string,@Body() b:Record<string,unknown>){return this.service.communicate(r.user,id(application),b);}
  @Patch('applications/:id/stage') stage(@Req() r:AuthenticatedRequest,@Param('id') application:string,@Body() b:{stage?:string;reason?:string}){return this.service.stage(r.user,id(application),String(b.stage||''),b.reason);}
  @Post('applications/:id/recommend') recommend(@Req() r:AuthenticatedRequest,@Param('id') application:string,@Body() b:{note?:string}){return this.service.recommend(r.user,id(application),String(b.note||''));}
  @Post('applications/:id/interviews') interview(@Req() r:AuthenticatedRequest,@Param('id') application:string,@Body() b:Record<string,unknown>){return this.service.interview(r.user,id(application),b);}
  @Patch('interviews/:id') changeInterview(@Req() r:AuthenticatedRequest,@Param('id') interview:string,@Body() b:Record<string,unknown>){return this.service.changeInterview(r.user,id(interview),b);}
  @Post('applications/:id/evaluations') evaluate(@Req() r:AuthenticatedRequest,@Param('id') application:string,@Body() b:Record<string,unknown>){return this.service.evaluate(r.user,id(application),b);}
  @Post('applications/:id/checks') check(@Req() r:AuthenticatedRequest,@Param('id') application:string,@Body() b:Record<string,unknown>){return this.service.check(r.user,id(application),b);}
  @Post('applications/:id/independence') independence(@Req() r:AuthenticatedRequest,@Param('id') application:string,@Body() b:Record<string,unknown>){return this.service.independence(r.user,id(application),b);}
  @Get('offer-template') template(@Req() r:AuthenticatedRequest){return this.service.template(r.user);}
  @Patch('offer-template') saveTemplate(@Req() r:AuthenticatedRequest,@Body() b:{body?:string}){return this.service.saveTemplate(r.user,String(b.body||''));}
  @Post('offer-template/approve') approveTemplate(@Req() r:AuthenticatedRequest){return this.service.approveTemplate(r.user);}
  @Post('applications/:id/offers') offer(@Req() r:AuthenticatedRequest,@Param('id') application:string,@Body() b:Record<string,unknown>){return this.service.offer(r.user,id(application),b);}
  @Post('offers/:id/approve') approveOffer(@Req() r:AuthenticatedRequest,@Param('id') offer:string){return this.service.approveOffer(r.user,id(offer));}
  @Post('offers/:id/send') sendOffer(@Req() r:AuthenticatedRequest,@Param('id') offer:string){return this.service.sendOffer(r.user,id(offer));}
  @Post('offers/:id/respond') respond(@Req() r:AuthenticatedRequest,@Param('id') offer:string,@Body() b:Record<string,unknown>){return this.service.response(r.user,id(offer),b);}
}
