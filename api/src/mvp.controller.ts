import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { AuthenticatedRequest, Public } from './auth';
import { RecruitmentService } from './recruitment.service';
import { LeaveService } from './leave.service';
import { RecordsService } from './records.service';
import { SelectionService } from './selection.service';

const id=(raw:string)=>{const value=Number(raw);if(!Number.isInteger(value)||value<1)throw new BadRequestException('Identificador inválido');return value;};

@Controller('api')
export class MvpController {
  constructor(private readonly recruitment:RecruitmentService,private readonly leave:LeaveService,private readonly records:RecordsService,private readonly selection:SelectionService) {}
  @Public() @Get('careers') careers(){return this.recruitment.publicList();}
  @Public() @Get('careers/:id') career(@Param('id') vacancy:string){return this.recruitment.publicOne(id(vacancy));}
  @Public() @Post('careers/:id/apply') apply(@Param('id') vacancy:string,@Body() body:Record<string,unknown>){return this.recruitment.apply(id(vacancy),body);}
  @Get('vacancies') vacancies(@Req() req:AuthenticatedRequest){return this.recruitment.list(req.user);}
  @Get('vacancies/question-library') questionLibrary(@Req() req:AuthenticatedRequest){return this.recruitment.questionLibrary(req.user);}
  @Post('vacancies') newVacancy(@Req() req:AuthenticatedRequest,@Body() body:Record<string,unknown>){return this.recruitment.create(req.user,body);}
  @Patch('vacancies/:id') editVacancy(@Req() req:AuthenticatedRequest,@Param('id') vacancy:string,@Body() body:Record<string,unknown>){return this.recruitment.update(req.user,id(vacancy),body);}
  @Patch('vacancies/:id/questions') vacancyQuestions(@Req() req:AuthenticatedRequest,@Param('id') vacancy:string,@Body() body:{questions?:unknown}){return this.recruitment.setQuestions(req.user,id(vacancy),body?.questions);}
  @Post('vacancies/:id/actions/:action') vacancyAction(@Req() req:AuthenticatedRequest,@Param('id') vacancy:string,@Param('action') action:string){return this.recruitment.transition(req.user,id(vacancy),action);}
  @Get('vacancies/:id/channels') channels(@Req() req:AuthenticatedRequest,@Param('id') vacancy:string){return this.recruitment.channels(req.user,id(vacancy));}
  @Post('vacancies/:id/channels') addChannel(@Req() req:AuthenticatedRequest,@Param('id') vacancy:string,@Body() body:Record<string,unknown>){return this.recruitment.addChannel(req.user,id(vacancy),body);}
  @Get('vacancies/:id/applications') applications(@Req() req:AuthenticatedRequest,@Param('id') vacancy:string){return this.recruitment.applications(req.user,id(vacancy));}
  @Patch('applications/:id/stage') applicationStage(@Req() req:AuthenticatedRequest,@Param('id') application:string,@Body() body:{stage?:string;reason?:string}){return this.selection.stage(req.user,id(application),body?.stage||'',body?.reason);}
  @Get('applications/:id/cv') applicationCv(@Req() req:AuthenticatedRequest,@Param('id') application:string){return this.recruitment.cv(req.user,id(application));}

  @Get('leave/types') leaveTypes(){return this.leave.types();}
  @Get('leave/announcements') announcements(@Req() req:AuthenticatedRequest){return this.leave.announcements(req.user);}
  @Post('leave/announcements') addAnnouncement(@Req() req:AuthenticatedRequest,@Body() body:{title?:string;body?:string}){return this.leave.addAnnouncement(req.user,body?.title,body?.body);}
  @Patch('leave/announcements/:id') setAnnouncementActive(@Req() req:AuthenticatedRequest,@Param('id') announcement:string,@Body() body:{active?:boolean}){if(typeof body?.active!=='boolean')throw new BadRequestException('Estado inválido');return this.leave.setAnnouncementActive(req.user,id(announcement),body.active);}
  @Post('leave/types') addLeaveType(@Req() req:AuthenticatedRequest,@Body() body:{name?:string;pay_treatment?:string}){return this.leave.addType(req.user,body?.name||'',body?.pay_treatment||'Pagada');}
  @Patch('leave/types/:id/pay-treatment') setLeavePayTreatment(@Req() req:AuthenticatedRequest,@Param('id') id:string,@Body() body:{pay_treatment?:string}){return this.leave.setPayTreatment(req.user,Number(id),body?.pay_treatment||'');}
  @Get('leave/balances') balances(@Req() req:AuthenticatedRequest,@Query('employee') employee?:string){return this.leave.balance(req.user,employee?id(employee):undefined);}
  @Patch('leave/balances/:employee/:type') setBalance(@Req() req:AuthenticatedRequest,@Param('employee') employee:string,@Param('type') type:string,@Body() body:{hours?:number}){return this.leave.setBalance(req.user,id(employee),id(type),Number(body?.hours));}
  @Get('leave/requests') leaveRequests(@Req() req:AuthenticatedRequest,@Query('employee') employee?:string){return this.leave.list(req.user,employee?id(employee):undefined);}
  @Post('leave/requests') requestLeave(@Req() req:AuthenticatedRequest,@Body() body:Record<string,unknown>){return this.leave.create(req.user,body);}
  @Get('leave/queue') leaveQueue(@Req() req:AuthenticatedRequest){return this.leave.queue(req.user);}
  @Patch('leave/requests/:id/decision') decideLeave(@Req() req:AuthenticatedRequest,@Param('id') request:string,@Body() body:{approve?:boolean;reason?:string}){if(typeof body?.approve!=='boolean')throw new BadRequestException('Indica una decisión');return this.leave.decide(req.user,id(request),body.approve,body.reason);}
  @Patch('leave/requests/:id/cancel') cancelLeave(@Req() req:AuthenticatedRequest,@Param('id') request:string){return this.leave.cancel(req.user,id(request));}
  @Get('leave/out') out(@Req() req:AuthenticatedRequest){return this.leave.out(req.user);}

  @Get('records/benefits') benefitCatalog(){return this.records.benefitCatalog();}
  @Get('records/company-documents') companyDocuments(@Req() req:AuthenticatedRequest){return this.records.companyDocuments(req.user);}
  @Post('records/company-documents') uploadCompanyDocument(@Req() req:AuthenticatedRequest,@Body() body:Record<string,unknown>){return this.records.uploadCompanyDocument(req.user,body);}
  @Get('records/company-documents/:id/file') companyFile(@Req() req:AuthenticatedRequest,@Param('id') document:string){return this.records.companyFile(req.user,id(document));}
  @Post('records/benefits') addBenefit(@Req() req:AuthenticatedRequest,@Body() body:Record<string,unknown>){return this.records.addBenefit(req.user,body);}
  @Get('records/employees/:id/benefits') employeeBenefits(@Req() req:AuthenticatedRequest,@Param('id') employee:string){return this.records.benefits(req.user,id(employee));}
  @Post('records/employees/:id/benefits') assignBenefit(@Req() req:AuthenticatedRequest,@Param('id') employee:string,@Body() body:Record<string,unknown>){return this.records.assignBenefit(req.user,id(employee),body);}
  @Get('records/employees/:id/documents') documents(@Req() req:AuthenticatedRequest,@Param('id') employee:string){return this.records.documents(req.user,id(employee));}
  @Post('records/employees/:id/documents') uploadDocument(@Req() req:AuthenticatedRequest,@Param('id') employee:string,@Body() body:Record<string,unknown>){return this.records.uploadDocument(req.user,id(employee),body);}
  @Get('records/documents/:id/file') download(@Req() req:AuthenticatedRequest,@Param('id') document:string){return this.records.download(req.user,id(document));}
  @Get('records/trainings') trainingCatalog(){return this.records.trainingCatalog();}
  @Post('records/trainings') addTraining(@Req() req:AuthenticatedRequest,@Body() body:Record<string,unknown>){return this.records.addTraining(req.user,body);}
  @Get('records/employees/:id/trainings') employeeTrainings(@Req() req:AuthenticatedRequest,@Param('id') employee:string){return this.records.trainings(req.user,id(employee));}
  @Post('records/employees/:id/trainings') assignTraining(@Req() req:AuthenticatedRequest,@Param('id') employee:string,@Body() body:Record<string,unknown>){return this.records.assignTraining(req.user,id(employee),body);}
  @Patch('records/trainings/:id/complete') completeTraining(@Req() req:AuthenticatedRequest,@Param('id') assignment:string){return this.records.completeTraining(req.user,id(assignment));}
  @Get('records/employees/:id/onboarding') onboarding(@Req() req:AuthenticatedRequest,@Param('id') employee:string){return this.records.onboarding(req.user,id(employee));}
  @Get('records/employees/:id/onboarding-packet') packet(@Req() req:AuthenticatedRequest,@Param('id') employee:string){return this.records.packet(req.user,id(employee));}
  @Post('records/employees/:id/onboarding-packet') sendPacket(@Req() req:AuthenticatedRequest,@Param('id') employee:string,@Body() body:{welcome_text?:string}){return this.records.sendPacket(req.user,id(employee),body?.welcome_text);}
  @Patch('records/employees/:id/onboarding-packet/view') viewPacket(@Req() req:AuthenticatedRequest,@Param('id') employee:string){return this.records.viewPacket(req.user,id(employee));}
  @Patch('records/employees/:id/onboarding-packet/cancel') cancelPacket(@Req() req:AuthenticatedRequest,@Param('id') employee:string){return this.records.cancelPacket(req.user,id(employee));}
  @Post('records/employees/:id/onboarding') addTask(@Req() req:AuthenticatedRequest,@Param('id') employee:string,@Body() body:Record<string,unknown>){return this.records.addTask(req.user,id(employee),body);}
  @Patch('records/onboarding/:id/complete') completeTask(@Req() req:AuthenticatedRequest,@Param('id') task:string){return this.records.completeTask(req.user,id(task));}
}
