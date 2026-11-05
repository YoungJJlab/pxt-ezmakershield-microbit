#include <array>
#include <vector>
#include <map>
#include <functional>
#include <iostream>
#include <cstdlib>
#include <cmath>
#include "bmp280.h"

static unsigned checks = 0;
#define CHECK(x) do { ++checks; if (!(x)) { std::cerr << "FAIL line " << __LINE__ << ": " << #x << "\n"; std::exit(1); } } while (0)
static void near(double value, double expected, double tolerance) { CHECK(std::abs(value - expected) <= tolerance); }
static const std::array<int,12> calibration = {{27504,26435,-1000,36477,-10685,3024,2855,140,-7,15500,-14600,6000}};
struct Sensor {
    std::array<int,12> cal = calibration;
    int t = 519888, p = 415148, id = 0x58, stuck = 0, fill = -1;
    int failRead = -1, failWriteReg = -1, failWriteValue = -1;
    std::vector<int> status;
    unsigned statusPosition = 0;
};
struct Op { char kind; int address, reg, value; unsigned length; };
struct Bus {
    std::map<int,Sensor> devices;
    std::vector<Op> ops;
    std::vector<unsigned> pauses;
    std::function<void(unsigned)> hook;
    Bus() { devices[0x77] = Sensor(); devices[0x76] = Sensor(); }
    bool read(int address, uint8_t reg, uint8_t *data, unsigned length) {
        ops.push_back({'R',address,reg,0,length});
        if (!devices.count(address)) return false;
        Sensor &s = devices[address];
        if (s.failRead == reg) return false;
        for (unsigned i=0;i<length;++i) data[i]=0;
        if (reg == 0xD0) { CHECK(length == 1); data[0]=s.id; }
        else if (reg == 0xF3) { CHECK(length == 1); data[0]=s.statusPosition<s.status.size()?s.status[s.statusPosition++]:s.stuck; }
        else if (reg == 0x88) {
            CHECK(length == 24);
            for (unsigned i=0;i<24;++i) data[i]=s.fill>=0?s.fill:uint8_t(s.cal[i/2]>>(8*(i%2)));
        } else if (reg == 0xF7) {
            CHECK(length == 6);
            data[0]=s.p>>12;data[1]=s.p>>4;data[2]=((s.p&15)<<4)|15;
            data[3]=s.t>>12;data[4]=s.t>>4;data[5]=((s.t&15)<<4)|15;
        } else CHECK(false);
        return true;
    }
    bool write(int address, uint8_t reg, uint8_t value) {
        ops.push_back({'W',address,reg,value,2});
        if (!devices.count(address)) return false;
        Sensor &s=devices[address];
        return !(s.failWriteReg==reg&&(s.failWriteValue<0||s.failWriteValue==value));
    }
    void sleep(unsigned ms) { pauses.push_back(ms); if (hook) hook(ms); }
    double readValue(double channel, double type, double reference=1013.25) { return ezmaker::bmp280::read(*this,channel,type,reference); }
};
struct Reference { double temperature, pressure; };
// Independent fixed-point/64-bit oracle (Bosch section 3.11.3), unlike the driver's doubles.
static Reference oracle(const Sensor &s) {
    const auto &c=s.cal;
    int64_t delta=(s.t>>4)-c[0];
    int64_t fine=(((int64_t(s.t>>3)-2*c[0])*c[1])>>11)+((((delta*delta)>>12)*c[2])>>14);
    double temperature=double((fine*5+128)>>8)/100.0;
    int64_t v1=fine-128000;
    int64_t v2=v1*v1*c[8]+v1*c[7]*131072+int64_t(c[6])*34359738368LL;
    v1=(((1LL<<47)+((v1*v1*c[5])>>8)+v1*c[4]*4096)*c[3])>>33;
    int64_t p=(((int64_t(1048576-s.p)*2147483648LL-v2)*3125)/v1);
    v1=(int64_t(c[11])*(p>>13)*(p>>13))>>25;
    v2=(int64_t(c[10])*p)>>19;
    p=((p+v1+v2)>>8)+int64_t(c[9])*16;
    return {temperature,double(p)/25600.0};
}
int main() {
    for(int channel: {0,1}) {
        Bus bus;
        CHECK(bus.readValue(channel,0)==1006.53);
        CHECK(bus.readValue(channel,2)==25.08);
        near(bus.readValue(channel,1),56.08,0.03);
        for(const auto &op:bus.ops) CHECK(op.address==(channel==0?0x77:0x76));
        bool forced=false,waited=false;
        for(const auto &op:bus.ops) if(op.kind=='W'&&op.reg==0xF4&&op.value==0x2D) forced=true;
        for(unsigned ms:bus.pauses) if(ms==15)waited=true;
        CHECK(forced&&waited);
        CHECK(bus.readValue(channel,1,1000)<bus.readValue(channel,1,1020));
        CHECK(bus.readValue(channel,0,NAN)==1006.53);
    }
    for(int variant: {0,1}) for(int t: {360000,420000,480000,519888,560000,600000}) for(int p: {330000,415148,480000}) {
        Bus bus; Sensor &s=bus.devices[0x77]; s.t=t;s.p=p;
        if(variant) { s.cal[3]=40000;s.cal[4]=-10000;s.cal[5]=2800;s.cal[6]=2600;s.cal[7]=-100;s.cal[8]=-20;s.cal[9]=16000;s.cal[10]=-14000;s.cal[11]=5500; }
        Reference ref=oracle(s);
        if(ref.temperature>=-40&&ref.temperature<=85&&ref.pressure>=300&&ref.pressure<=1100) {
            near(bus.readValue(0,0),ref.pressure,0.05);near(bus.readValue(0,2),ref.temperature,0.02);
        } else CHECK(bus.readValue(0,0)==-9999);
    }
    {
        Bus bus; CHECK(bus.readValue(0,0)==1006.53);
        bus.devices[0x76].cal[3]=40000;
        CHECK(bus.readValue(1,0)!=1006.53);CHECK(bus.readValue(0,0)==1006.53);
        bus.devices.erase(0x77);CHECK(bus.readValue(0,0)==-9999);
        bus.devices[0x77]=Sensor();CHECK(bus.readValue(0,0)==1006.53);
        bus.devices[0x77].t=560000;CHECK(bus.readValue(0,2)!=25.08);
    }
    for(double channel: {-1.0,2.0,0.5,double(NAN),double(INFINITY)}) { Bus bus;CHECK(bus.readValue(channel,0)==-9999);CHECK(bus.ops.empty()); }
    for(double type: {-1.0,3.0,0.5,double(NAN),double(INFINITY)}) { Bus bus;CHECK(bus.readValue(0,type)==-9999);CHECK(bus.ops.empty()); }
    for(double reference: {0.0,-1.0,double(NAN),double(INFINITY),double(-INFINITY)}) {
        Bus bus;CHECK(bus.readValue(0,1,reference)==-9999);CHECK(bus.ops.empty());
    }
    std::vector<std::function<void(Sensor&)>> faults={
        [](Sensor&s){s.id=0;},[](Sensor&s){s.id=0x60;},[](Sensor&s){s.id=0x55;},
        [](Sensor&s){s.fill=0;},[](Sensor&s){s.fill=255;},[](Sensor&s){s.cal[3]=0;},
        [](Sensor&s){s.t=0x80000;},[](Sensor&s){s.p=0x80000;},[](Sensor&s){s.t=0xFFFFF;},[](Sensor&s){s.p=0xFFFFF;},
        [](Sensor&s){s.failRead=0xD0;},[](Sensor&s){s.failRead=0x88;},[](Sensor&s){s.failRead=0xF7;},[](Sensor&s){s.failRead=0xF3;},
        [](Sensor&s){s.failWriteReg=0xF5;},
        [](Sensor&s){s.failWriteReg=0xF4;s.failWriteValue=0x2C;},[](Sensor&s){s.failWriteReg=0xF4;s.failWriteValue=0x2D;},
        [](Sensor&s){s.stuck=1;},[](Sensor&s){s.stuck=8;}
    };
    for(const auto &fault:faults) {
        Bus bus;fault(bus.devices[0x77]);CHECK(bus.readValue(0,0)==-9999);
        bus.devices[0x77]=Sensor();CHECK(bus.readValue(0,0)==1006.53);
        unsigned total=0;for(unsigned ms:bus.pauses)total+=ms;CHECK(total<=130);
    }
    {
        Bus bus;bus.devices.clear();CHECK(bus.readValue(0,0)==-9999);CHECK(bus.readValue(1,2)==-9999);
        bus.devices[0x77]=Sensor();bus.devices[0x77].status={1,1,0,8,0,8,8,0};
        CHECK(bus.readValue(0,0)==1006.53);
        unsigned waits=0;for(unsigned ms:bus.pauses)if(ms==5)++waits;CHECK(waits==5);
    }
    for(int nestedChannel: {0,1}) {
        Bus bus;bool entered=false;double nested=0;
        bus.hook=[&](unsigned ms){if(ms==15&&!entered){entered=true;nested=bus.readValue(nestedChannel,0);}};
        CHECK(bus.readValue(0,0)==1006.53);CHECK(nested==(nestedChannel==0?-9999:1006.53));
        bus.hook=nullptr;CHECK(bus.readValue(0,0)==1006.53);
    }
    std::cout << "BMP280_NATIVE_CHECKS=" << checks << "\n";
}
